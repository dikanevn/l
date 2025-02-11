import { useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/js';

const TokenInfo = ({ setMetadataPda }) => {
  useEffect(() => {
    // Используйте корректный mint-адрес NFT вместо этого экземпляра
    const placeholder = "YOUR_NFT_MINT_ADDRESS";
    try {
      const mint = new PublicKey(placeholder);
      const pda = Metadata.getPDA(mint);
      setMetadataPda(pda.toString());
    } catch (error) {
      console.error("Неверный адрес mint. Пожалуйста, замените 'YOUR_NFT_MINT_ADDRESS' на корректный Base58 адрес.");
    }
  }, []);

  return null;
};

export default TokenInfo;
