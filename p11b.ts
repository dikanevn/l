import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as dotenv from "dotenv";

dotenv.config();

async function mintNFTToCollection() {
  // Проверяем наличие обязательных переменных
  if (!process.env.PAYER_SECRET_KEY) {
    throw new Error("PAYER_SECRET_KEY не установлен");
  }
  if (process.argv.length < 3) {
    throw new Error("Укажите адрес коллекции в качестве первого параметра");
  }

  // Получаем адрес коллекции из аргументов командной строки
  const collectionAddress = process.argv[2];
  const collectionPublicKey = new PublicKey(collectionAddress);

  // Парсинг секретного ключа и создание Keypair
  const secretKey = JSON.parse(process.env.PAYER_SECRET_KEY) as number[];
  const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
  console.log("Payer публичный ключ:", payer.publicKey.toString());

  // Подключаемся к сети Devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Инициализируем Metaplex с keypairIdentity
  const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

  // Создаём NFT, привязанный к коллекции
  const { nft } = await metaplex.nfts().create({
    uri: "https://arweave.net/your-nft-metadata", // Замените на реальный URI метаданных NFT
    name: "ProgNFTInCollection",
    sellerFeeBasisPoints: 500, // 5% роялти (при необходимости измените)
    symbol: "PNFTInC",
    creators: [
      {
        address: payer.publicKey,
        share: 100,
      },
    ],
    isMutable: true,
    // Значение 4 соответствует ProgrammableNonFungible (pNFT)
    tokenStandard: 4,
    ruleSet: null,
    // Привязка NFT к коллекции:
    // Передаём публичный ключ коллекции напрямую, т.к. ожидается тип PublicKey.
    collection: collectionPublicKey,
  });

  console.log("Создан NFT, привязанный к коллекции:");
  console.log("Mint адрес:", nft.address.toString());
  console.log("Название:", nft.name);
  console.log("Символ:", nft.symbol);
  console.log("URI:", nft.uri);
}

mintNFTToCollection().catch((error) => {
  console.error("Ошибка при создании NFT, привязанного к коллекции:", error);
}); 