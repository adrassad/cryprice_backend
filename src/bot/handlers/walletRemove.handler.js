export function walletRemoveHandler(bot) {
  bot.action('wallet:remove', async (ctx) => {
    await ctx.answerCbQuery(); // закрываем «часики» на кнопке

    // TODO: вывести список кошельков пользователя
    await ctx.reply('Выберите кошелек для удаления (в разработке)');
  });
}
