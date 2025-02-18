use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

// Определяем константы с жёстко заданными адресами.
pub const MY_SYSTEM_PROGRAM: Pubkey = pubkey!("11111111111111111111111111111111");
pub const MY_TOKEN_PROGRAM: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Объявляем идентификатор программы
declare_id!("2BESDrxqXxBWYwhiuzC4SgsoCmqoMiiEGwZ1en6gT4Se");

#[program]
pub mod l {
    use super::*;

    // Инструкция для создания нового SPL токена
    pub fn create_token(_ctx: Context<CreateToken>) -> Result<()> {
        msg!("SPL токен с decimals 0 создан успешно!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    /// CHECK: Этот аккаунт является плательщиком транзакции и должен подписывать её.
    #[account(mut, signer)]
    pub authority: AccountInfo<'info>,

    // Новый mint токена, который будет создан
    #[account(
        init, 
        payer = authority, 
        mint::decimals = 0, 
        mint::authority = authority, 
        mint::freeze_authority = authority
    )]
    pub mint: Account<'info, Mint>,

    // Системная программа: здесь добавлено ограничение, что переданный аккаунт должен совпадать с MY_SYSTEM_PROGRAM.
    #[account(address = MY_SYSTEM_PROGRAM)]
    pub system_program: Program<'info, System>,
    
    // Программа SPL Token: будет проверено, что адрес совпадает с MY_TOKEN_PROGRAM.
    #[account(address = MY_TOKEN_PROGRAM)]
    pub token_program: Program<'info, Token>,

    // Sysvar rent
    pub rent: Sysvar<'info, Rent>,
}
