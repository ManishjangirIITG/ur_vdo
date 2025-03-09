const checkVideoAccess = (req, res, next) => {
    const user = req.user;
    const videoDuration = req.video.duration;
    
    const planLimits = {
      free: 300,    // 5 minutes
      bronze: 420,  // 7 minutes
      silver: 600,  // 10 minutes
      gold: Infinity
    };
  
    if (videoDuration > planLimits[user.plan_type]) {
      return res.status(403).json({ 
        error: "Upgrade required",
        requiredPlan: Object.entries(planLimits)
          .find(([_, limit]) => limit >= videoDuration)[0]
      });
    }
    
    next();
  };
  