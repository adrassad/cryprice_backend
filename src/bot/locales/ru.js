// src/locales/ru.js
export default {
  // Общие
  main_menu: "🏠 Главное меню",
  welcome: "👋 Привет! Я ваш помощник.",
  error: "⚠️ Произошла ошибка. Попробуйте позже.",
  status: "Статус:",
  active: "✅ активна",
  expired: "❌ истекла",

  arrage: `\n\n🔒 Для продолжения работы оформите Pro`,
  start_welcome: `👋 Добро пожаловать!\n\n
      🤖 Aave Health Monitor

    Я отслеживаю health factor ваших кошельков в Aave (Arbitrum)
    и присылаю уведомление, если он падает ниже заданного значения.
    Бесплатный период 60 дней, далее необходимо оформить Pro-подписку.

    🔔 Уведомления 24/7
    💼 Поддержка нескольких кошельков
    ⚡ Pro-подписка для расширенных возможностей`,
  upgrade_pro: `Чтобы активировать PRO подписку, напишите в поддержку.
        Мы подключим PRO и отправим инструкции по оплате.
        💬 Нажмите /support"`,

  //Команды телеги
  help_command: `ℹ️ Доступные команды:
  /start — начать
  /help — помощь
  /status - статус пользователя
  /positions - позиции на aave
  /healthfactor - 🛡 Показать healthfacror на aave`,
  command_wallet_no_add:
    "⚠️ У вас ещё нет кошельков. Добавьте через ➕ Add Wallet.",
  command_wallet_select:
    "💼 Выберите кошелек для получения healthfactor на Aave:",
  command_show_positions: "💼 Выберите кошелек для просмотра позиций:",

  // Поддержка
  support_enter:
    "✍️ Напишите ваше сообщение в поддержку.\n\nДля отмены отправьте /cancel",
  support_canceled: "❌ Отправка сообщения отменена.",
  support_sent: "✅ Ваше сообщение отправлено в поддержку.",
  support_sent_title: "Новое обращение в поддержку",
  support_answer: "💬 Ответить",
  support_no_rules: "Недостаточно прав",
  support_enter_answer: "✍️ Введите ответ пользователю:",
  support_answer_support: "Ответ поддержки:",
  support_answered_user: "✅ Ответ отправлен пользователю.",
  support_answered_support: "✅ Ваше сообщение отправлено в поддержку.",
  message: "Сообщение:",
  // Позиции и Aave
  no_active_positions: "ℹ️ Нет активных позиций в Aave.",
  positions_overview: "📊 Ваши текущие позиции:",

  no_user: "❌ Пользователь не найден",
  subscribe_need_pro: "🔒 Требуется Pro подписка.",
  novalid_address:
    "❌ Невалидный адрес.\n\nОтправьте корректный адрес или /cancel",

  //Кошельки
  no_wallet: "❌ Кошелек не найден",
  wallet_you_have:
    "⚠️ Этот кошелёк уже добавлен.\nОтправьте другой адрес или /cancel",
  wallet_buttom_add: "➕ Добавить кошелёк",
  wallet_buttom_del: "'➖ Удалить кошелёк'",
  wallet_deleted: "🗑 Кошелёк удалён",
  wallet_deleted_success: "✅ Кошелёк успешно удалён",
  wallet_select_delete: "💼 Выберите кошелек для удаления:",
  wallet_deleted_error: "❌ Ошибка",
  wallet_deleted_failed: "⚠️ Не удалось удалить кошелёк",
  wallet_send: `➕ Отправьте адрес EVM кошелька
      Пример:
      0x1234...abcd
      Для отмены: /cancel`,
  wallet_send_canceled: "❌ Добавление кошелька отменено",
  wallet_sending: `ℹ️ Сейчас идёт добавление кошелька.
      Отправьте адрес или /cancel`,
  wallet_added: "✅ Кошелёк успешно добавлен",

  //Статус подписки
  subscribe_status: "📊 Статус подписки\n\n",
  subscribe_type: "Тип:",
  subscribe_rules: "Доступ до:",

  // Healthfactor
  healthfactor_overview: "🛡 Ваш текущий Health Factor:",

  //support
  support_write_message: `✍️ Напишите ваше сообщение в поддержку.
      Чтобы отменить — отправьте /cancel`,
  support_new_message: "📩 Новое сообщение в поддержку",
  support_message_sent: "✅ Сообщение отправлено в поддержку. Спасибо!",
  support_message_error: "❌ Ошибка при отправке сообщения.",
  support_message_error: "❌ Отправка отменена.",
  support_name_user: "📛 Имя:",
  support_message: "💬 Сообщение:",

  // Ошибки
  error_generic: "❌ Произошла ошибка. Попробуйте ещё раз.",
};
