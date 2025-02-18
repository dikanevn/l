use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

// Объявляем идентификатор программы
declare_id!("2BESDrxqXxBWYwhiuzC4SgsoCmqoMiiEGwZ1en6gT4Se");

#[program]
pub mod l {
    use super::*;

    // Инструкция для создания нового SPL токена
    pub fn create_token(_ctx: Context<CreateToken>) -> Result<()> {
        msg!("SPL токен создан успешно!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    /// CHECK: Этот аккаунт является плательщиком транзакции и должен подписывать её. Дополнительные проверки не требуются.
    #[account(mut, signer)]
    pub authority: AccountInfo<'info>,

    // Новый mint токена, который будет создан
    #[account(init, payer = authority, mint::decimals = 9, mint::authority = authority)]
    pub mint: Account<'info, Mint>,

    // Системная программа
    pub system_program: Program<'info, System>,
    
    // Программа SPL Token
    pub token_program: Program<'info, Token>,

    // Sysvar rent
    pub rent: Sysvar<'info, Rent>,
}
