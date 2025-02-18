use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;

// Определяем константы с жёстко заданными адресами.
pub const MY_SYSTEM_PROGRAM: Pubkey = pubkey!("11111111111111111111111111111111");
pub const MY_TOKEN_PROGRAM: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Объявляем идентификатор программы
declare_id!("2BESDrxqXxBWYwhiuzC4SgsoCmqoMiiEGwZ1en6gT4Se");

#[program]
pub mod l {
    use super::*;

    // Инструкция для создания нового SPL токена
    pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
        msg!("SPL токен с decimals 0 создан успешно!");

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.ata.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        anchor_spl::token::mint_to(cpi_ctx, 1)?;

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

    // Ассоциированный токен-аккаунт для mint и authority.
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub ata: Box<Account<'info, TokenAccount>>,

    // Системная программа: здесь добавлено ограничение, что переданный аккаунт должен совпадать с MY_SYSTEM_PROGRAM.
    #[account(address = MY_SYSTEM_PROGRAM)]
    pub system_program: Program<'info, System>,
    
    // Программа SPL Token: будет проверено, что адрес совпадает с MY_TOKEN_PROGRAM.
    #[account(address = MY_TOKEN_PROGRAM)]
    pub token_program: Program<'info, Token>,

    // Associated Token Program: проверяем, что это именно официальный адрес.
    #[account(address = AssociatedToken::id())]
    pub associated_token_program: Program<'info, AssociatedToken>,

    // Sysvar rent
    pub rent: Sysvar<'info, Rent>,
}
