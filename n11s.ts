import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

async function getMintInfo(mintAddress) {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const mintPubKey = new PublicKey(mintAddress);

    const accountInfo = await connection.getParsedAccountInfo(mintPubKey);
    console.log(mintAddress);
    console.log("Mint Account Data:", accountInfo.value.data);
}

const mintAddress = "75Mpk7mkBD482EnxtK6zsC7G4HZhp7Rp5TSzQaFx2w2y"; // Подставь свой
getMintInfo(mintAddress);
