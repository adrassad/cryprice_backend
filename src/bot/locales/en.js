// src/locales/en.js
export default {
  // General
  main_menu: "🏠 Main menu",
  welcome: "👋 Hello! I'm your assistant.",
  error: "⚠️ An error occurred. Please try again later.",
  status: "Status:",
  active: "✅ active",
  expired: "❌ expired",

  arrage: `\n\n🔒 To continue using the service, please upgrade to Pro`,
  start_welcome: `👋 Welcome!\n\n
      🤖 Aave Health Monitor

    I monitor the health factor of your wallets in Aave (Arbitrum)
    and send a notification if it drops below the specified value.
    The free period is 30 days, after which a Pro subscription is required.

    🔔 24/7 notifications
    💼 Support for multiple wallets
    ⚡ Pro subscription for extended features`,

  upgrade_pro: `To activate the PRO subscription, contact support.
        We will enable PRO and send payment instructions.
        💬 Press /support`,

  // Telegram commands
  help_command: `ℹ️ Available commands:
  /start — start
  /help — help
  /status - user status
  /positions - positions in Aave
  /healthfactor - 🛡 Show health factor on Aave`,

  command_wallet_no_add:
    "⚠️ You don't have any wallets yet. Add one via ➕ Add Wallet.",
  command_wallet_select: "💼 Select a wallet to get the health factor on Aave:",
  command_show_positions: "💼 Select a wallet to view positions:",

  // Support
  support_enter: "✍️ Write your message to support.\n\nTo cancel send /cancel",
  support_canceled: "❌ Message sending canceled.",
  support_sent: "✅ Your message has been sent to support.",
  support_sent_title: "New support request",
  support_answer: "💬 Reply",
  support_no_rules: "Not enough permissions",
  support_enter_answer: "✍️ Enter your reply to the user:",
  support_answer_support: "Support reply:",
  support_answered_user: "✅ Reply sent to the user.",
  support_answered_support: "✅ Your message has been sent to support.",
  message: "Message:",

  // Positions and Aave
  no_active_positions: "ℹ️ No active positions in Aave.",
  positions_overview: "📊 Your current positions:",

  no_user: "❌ User not found",
  subscribe_need_pro: "🔒 Pro subscription required.",
  novalid_address: "❌ Invalid address.\n\nSend a valid address or /cancel",

  // Wallets
  no_wallet: "❌ Wallet not found",
  wallet_you_have:
    "⚠️ This wallet is already added.\nSend another address or /cancel",
  wallet_buttom_add: "➕ Add wallet",
  wallet_buttom_del: "➖ Delete wallet",
  wallet_deleted: "🗑 Wallet deleted",
  wallet_deleted_success: "✅ Wallet successfully deleted",
  wallet_select_delete: "💼 Select a wallet to delete:",
  wallet_deleted_error: "❌ Error",
  wallet_deleted_failed: "⚠️ Failed to delete wallet",
  wallet_send: `➕ Send an EVM wallet address
      Example:
      0x1234...abcd
      To cancel: /cancel`,
  wallet_send_canceled: "❌ Wallet addition canceled",
  wallet_sending: `ℹ️ Wallet addition in progress.
      Send an address or /cancel`,
  wallet_added: "✅ Wallet successfully added",

  // Subscription status
  subscribe_status: "📊 Subscription status\n\n",
  subscribe_type: "Type:",
  subscribe_rules: "Access until:",

  // Healthfactor
  healthfactor_overview: "🛡 Your current Health Factor:",

  // Support
  support_write_message: `✍️ Write your message to support.
      To cancel — send /cancel`,
  support_new_message: "📩 New support message",
  support_message_sent: "✅ Message sent to support. Thank you!",
  support_message_error: "❌ Error sending the message.",
  support_message_canceled: "❌ Sending canceled.",
  support_name_user: "📛 Name:",
  support_message: "💬 Message:",

  // Errors
  error_generic: "❌ An error occurred. Please try again.",
};
