import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { MerkleTree } from "merkletreejs";

// Определяем __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Настройка провайдера из окружения (.env)
anchor.setProvider(anchor.AnchorProvider.env());
const provider = anchor.getProvider() as anchor.AnchorProvider;

// Получаем программу "l" из workspace
const program = anchor.workspace.l as anchor.Program;

// Константа FIXED_MINT, как указана в программе
const FIXED_MINT = new PublicKey("91aT1KmqDzdBD6ZvJVFx79wdLv7WsgYQLkqXYv2Gxqpk");

// Загрузка корня меркл-дерева из файла merkleRoot
const merkleRootStr = fs.readFileSync(path.join(__dirname, "../merkleRoot"), "utf8").trim();
const expectedMerkleRoot = Buffer.from(merkleRootStr, "hex");

// Загрузка массива листьев (в виде hex-строк) и преобразование в Buffer
const leavesData = fs.readFileSync(path.join(__dirname, "../mleaves.json"), "utf8");
const leavesHex: string[] = JSON.parse(leavesData);
const leaves = leavesHex.map(hex => Buffer.from(hex, "hex"));
console.log("Leaves (в тестовом скрипте):", leaves.map(leaf => leaf.toString("hex")));

// Загрузка массива адресов (адреса в base58)
const maddrsData = fs.readFileSync(path.join(__dirname, "../maddrs.json"), "utf8");
const addrList: string[] = JSON.parse(maddrsData);

// Функция хэширования, используемая в mer2.ts для вычисления SHA256
const hashFn = (data: Buffer): Buffer => crypto.createHash("sha256").update(data).digest();

// Отсортируем листья так же, как это делалось в mer2.ts
const sortedLeaves = leaves.slice().sort(Buffer.compare);
// Создаём экземпляр меркл-дерева на основании отсортированных листьев
const tree = new MerkleTree(sortedLeaves, hashFn, { sortPairs: true });

// Выводим вычисленный корневой хеш и сравниваем с ожидаемым (из файла merkleRoot)
const computedRoot = tree.getRoot();
console.log("Вычисленный корневой хеш меркл-дерева:", computedRoot.toString("hex"));
if (!computedRoot.equals(expectedMerkleRoot)) {
  console.error("Вычисленный корневой хеш не совпадает с ожидаемым!");
}

// Пример получения Merkle proof для конкретного leaf (например, для authority)
// const authorityLeaf = crypto.createHash("sha256").update(authority.toBuffer()).digest();
// const proof = tree.getProof(authorityLeaf).map(p => p.data);
// if (!tree.verify(proof, authorityLeaf, computedRoot)) {
//   throw new Error("Invalid Merkle Proof");
// }

console.log("l/tests IDL:", program.idl);

async function main() {
  try {
    // Получаем publicKey текущего authority (из кошелька провайдера)
    const authority = provider.wallet.publicKey;

    // Вычисляем leaf для authority так же, как в смарт-контракте: hash(authority)
    const authorityLeaf = crypto.createHash("sha256").update(authority.toBuffer()).digest();

    // Проверка наличия authority в списке разрешённых адресов отключена,
    // смарт-контракт проверит меркл доказательство.

    // Вычисляем меркл доказательство для authority
    const merkleProofBuffers = tree.getProof(authorityLeaf).map(p => p.data);
    console.log("Merkle Proof (в hex):", merkleProofBuffers.map(buf => buf.toString("hex")));

    // Вычисляем PDA для mint_authority согласно программе (с сидом "mint_authority")
    const [mintAuthority, mintAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from("mint_authority")],
      program.programId
    );

    // Вычисляем ассоциированный токен-аккаунт для FIXED_MINT и authority
    const tokenAccount = await getAssociatedTokenAddress(
      FIXED_MINT,
      authority
    );

    // Вызов инструкции mint_one, передаём меркл доказательство.
    // Преобразуем каждый Buffer proof в Uint8Array, чтобы типы совпадали с ожидаемыми.
    const merkleProof = merkleProofBuffers.map(buf => Uint8Array.from(buf));

    console.log("Параметры для вызова mintOne (тестовый скрипт):");
    console.log("Authority:", authority.toString());
    console.log("Mint:", FIXED_MINT.toString());
    console.log("Token Account:", tokenAccount.toString());
    console.log("Mint Authority:", mintAuthority.toString());
    console.log("Merkle Proof (arrays):", merkleProof);

    // Собираем транзакцию без отправки
    const tx = await program.methods.mintOne(merkleProof)
      .accounts({
        authority: authority,
        mint: FIXED_MINT,
        tokenAccount: tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        mintAuthority: mintAuthority,
      })
      .transaction();

    // Логируем данные инструкций транзакции
    console.log("Transaction instructions (l/tests/l.ts):", tx.instructions.map(ix => ix.data.toString('hex')));

    // По-прежнему можно вызвать .rpc() позже, если потребуется:
    // const txSignature = await provider.sendAndConfirm(tx);
  } catch (error) {
    console.error("Ошибка при выполнении транзакции:", error);
  }
}

main(); 