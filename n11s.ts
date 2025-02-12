import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

async function getMintInfo(mintAddress) {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const mintPubKey = new PublicKey(mintAddress);

    const accountInfo = await connection.getParsedAccountInfo(mintPubKey);
    console.log(mintAddress);
    console.log("Mint Account Data:", accountInfo.value.data);
}

const mintAddress = "5ud9zyD5M9Tf96HYe1hhNDFaqJRC7hMy6hL2ojytBPT7"; // Подставь свой
getMintInfo(mintAddress);
