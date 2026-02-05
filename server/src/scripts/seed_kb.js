import { connectDb } from "../db.js";
import { KnowledgeArticle } from "../models/KnowledgeArticle.js";

async function main() {
  await connectDb();

  const articles = [
    {
      title: "Reset your password",
      tags: ["account", "password", "login"],
      body:
        "To reset your password: 1) Go to the login screen 2) Click 'Forgot password' 3) Enter your email 4) Follow the reset link in your inbox. If you don't see it, check Spam/Junk.",
    },
    {
      title: "Refund policy",
      tags: ["billing", "refund", "policy"],
      body:
        "Refunds are available within 14 days of purchase for eligible plans. To request a refund, share your order ID and the email used at checkout with our support team.",
    },
    {
      title: "Order status and tracking",
      tags: ["orders", "shipping", "tracking"],
      body:
        "You can track your order from your account page under 'Orders'. If tracking hasn't updated in 48 hours, contact support with your order number.",
    },
  ];

  await KnowledgeArticle.deleteMany({});
  await KnowledgeArticle.insertMany(articles);

  // eslint-disable-next-line no-console
  console.log(`Seeded ${articles.length} knowledge base articles.`);
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


