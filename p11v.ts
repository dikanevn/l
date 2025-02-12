import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as dotenv from "dotenv";

dotenv.config();

async function verifyNFTCollection() {
  // Проверка обязательной переменной окружения.
  if (!process.env.PAYER_SECRET_KEY) {
    throw new Error("PAYER_SECRET_KEY не установлен");
  }
  // Проверка наличия двух параметров: mint-адрес NFT и mint-адрес коллекции.
  if (process.argv.length < 4) {
    throw new Error("Укажите mint-адрес NFT и mint-адрес коллекции в аргументах");
  }

  // Получаем mint-адреса из аргументов командной строки.
  const nftMintAddress = process.argv[2];
  const collectionMintAddress = process.argv[3];

  const nftMintPublicKey = new PublicKey(nftMintAddress);
  const collectionMintPublicKey = new PublicKey(collectionMintAddress);

  // Парсинг секретного ключа и создание Keypair.
  const secretKey = JSON.parse(process.env.PAYER_SECRET_KEY) as number[];
  const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
  console.log("Payer публичный ключ:", payer.publicKey.toString());

  // Подключаемся к сети Devnet.
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Инициализируем Metaplex с использованием keypairIdentity.
  const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

  // Проверяем, что NFT уже имеет установленную коллекцию и она соответствует указанной.
  const nftBefore = await metaplex.nfts().findByMint({ mintAddress: nftMintPublicKey });
  if (!nftBefore.collection) {
    throw new Error("NFT не имеет коллекционной информации");
  }
  if (nftBefore.collection.address.toString() !== collectionMintPublicKey.toString()) {
    throw new Error("Коллекция NFT не соответствует указанной коллекции");
  }
  console.log("NFT до верификации:", {
    mint: nftBefore.address.toString(),
    collection: nftBefore.collection.address.toString(),
    verified: nftBefore.collection.verified,
  });

  // Вызываем метод верификации коллекции.
  // В текущей версии SDK метод принимает только { mintAddress }.
  await metaplex.nfts().verifyCollection({ 
    mintAddress: nftMintPublicKey, 
    collectionMintAddress: collectionMintPublicKey 
  });

  // Запрашиваем обновлённые данные NFT для проверки статуса верификации.
  const updatedNft = await metaplex.nfts().findByMint({ mintAddress: nftMintPublicKey });
  console.log("NFT после верификации:");
  console.log("Mint адрес NFT:", updatedNft.address.toString());
  console.log("Коллекция:", updatedNft.collection?.address.toString());
  console.log("Верифицирован:", updatedNft.collection?.verified);
}

verifyNFTCollection().catch((error) => {
  console.error("Ошибка при верификации коллекции:", error);
}); 