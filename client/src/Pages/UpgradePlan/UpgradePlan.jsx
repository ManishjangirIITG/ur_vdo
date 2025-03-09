import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpgradePlan.css';

const UpgradePlan = () => {
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('Profile'))?.result;
  console.log('user from UpgradePlan : ', user);

  // Fetch current plan from server on component mount
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        if (user?._id) {
          const { data } = await axios.get(`/api/users/${user._id}`);
          setCurrentPlan(data.plan_type);
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      }
    };
    fetchCurrentPlan();
  }, [user?._id]);

  const plans = [
    {
      name: 'Free',
      price: 0,
      duration: '5 mins',
      features: ['5 min per session']
    },
    {
      name: 'Bronze',
      price: 10,
      duration: '7 mins',
      features: ['7 min per session']
    },
    {
      name: 'Silver',
      price: 50,
      duration: '10 mins',
      features: ['10 min per session']
    },
    {
      name: 'Gold',
      price: 100,
      duration: 'Unlimited',
      features: ['unlimited watch time']
    }
  ];

  // Changed from handlePayment to handleUpgrade
  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('Profile'))?.result;
      console.log('user from UpgradePlan : ', user);
      if (!user) throw new Error('User not logged in');

      const { data: order } = await axios.post('/api/create-order', {
        amount: plan.price * 100,
        currency: 'INR'
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Your Video Platform",
        description: plan.name,
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log('Payment verification request payload:', {
              paymentId: response.razorpay_payment_id,
              userId: user._id,
              plan: plan.name // Changed from plans.name to plan.name
            });

            const verificationResponse = await axios.post('/api/verify-payment', {
              paymentId: response.razorpay_payment_id,
              userId: user._id,
              plan: plan.name // Add proper request body
            });

            console.log('Verification response:', verificationResponse.data);

            // try {
            //   // Refresh user data
            //   const { data } = await axios.get('/api/me');
            //   localStorage.setItem('Profile', JSON.stringify(data));
            //   setCurrentPlan(data.plan_type);
            //   alert('Upgrade successful!');
            // } catch (refreshError) {
            //   console.error('Refresh failed:', refreshError);
            //   alert('Payment verified but session update failed');
            // }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert(error.response?.data?.error || 'Payment verification failed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="upgrade-container">
      <h2>Choose Your Plan</h2>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.name === currentPlan ? 'current-plan' : ''}`}
          >
            <h3>{plan.name}</h3>
            <div className="price">
              ₹{plan.price}{plan.price > 0 && '/mo'}
            </div>
            <ul>
              <li>{plan.duration} viewing</li>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan)}  // Fixed function name
              disabled={plan.name === currentPlan || loading}
            >
              {plan.name === currentPlan ? 'Current Plan' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradePlan;
