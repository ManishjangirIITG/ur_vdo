// Payment controller
const createOrder = async (plan) => {
    const plans = {
      bronze: 1000, // 10 INR in paise
      silver: 5000, // 50 INR
      gold: 10000  // 100 INR
    };
  
    return razorpay.orders.create({
      amount: plans[plan],
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
  };
  