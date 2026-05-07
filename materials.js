
// This function computes the materials needed to upgrade from currentLevel to targetLevel.
// Right now it works in steps of 10. Level 80 includes awakened and is the current max level.
function computeNeededMaterials(currentLevel, targetLevel) {
    var materialsByLevel = {
        10: { "EXP": 1170, "Gold": 15000, "N_Crystal": 40 },
        20: { "EXP": 2850, "Gold": 25000, "N_Crystal": 80 },
        30: { "EXP": 4680, "Gold": 50000, "N_Crystal": 160 },
        40: { "EXP": 9380, "Gold": 80000, "N_Crystal": 320, "R_Crystal": 150 },
        50: { "EXP": 18760, "Gold": 150000, "N_Crystal": 640, "R_Crystal": 300 },
        60: { "EXP": 37500, "Gold": 250000, "N_Crystal": 1200, "R_Crystal": 510, "SR_Crystal": 240 },
        70: { "EXP": 75000, "Gold": 400000, "N_Crystal": 2400, "R_Crystal": 1000, "SR_Crystal": 498 },
        80: { "EXP": 150050, "Gold": 250000, "N_Crystal": 1200, "R_Crystal": 480, "SR_Crystal": 180 }
    };
    var normalizedCurrentLevel = Number(currentLevel);
    var normalizedTargetLevel = Number(targetLevel);
    var totalMaterials = { "EXP": 0, "Gold": 0, "N_Crystal": 0, "R_Crystal": 0, "SR_Crystal": 0 };

    if (!materialsByLevel[normalizedTargetLevel] || normalizedTargetLevel <= normalizedCurrentLevel) {
        return totalMaterials;
    }

    for (var level = normalizedCurrentLevel + 10; level <= normalizedTargetLevel; level += 10) {
        var materials = materialsByLevel[level];

        if (!materials) {
            continue;
        }

        for (var key in materials) {
            totalMaterials[key] += materials[key];
        }
    }

    return totalMaterials;
}

// This function computes the number of pulls needed to guarantee one 5* memory.
// Depending on the banner type there might also be free pulls or pull rewards.
function savedPullsNeeded(currentPity, bannerType) {
    var normalizedCurrentPity = Number(currentPity);
    var freePulls = 0;

    switch (bannerType) {
        case "myth":
        case "multi":
            freePulls = 10;
            break;
        case "birthday":
            freePulls = 20;
            break;
        default:
            freePulls = 0;
    }

    var ticketsNeeded = Math.max(0, normalizedCurrentPity + 70 - freePulls);

    return {
        "tickets": ticketsNeeded,
        "diamonds": ticketsNeeded * 150
    };
}

function getCurrentEXP(nBottles, rBottles, srBottles, ssrBottles) {
    return Number(nBottles) * 10 + Number(rBottles) * 50 + Number(srBottles) * 250 + Number(ssrBottles) * 1000;
}

const monthlyRewards = {
    3: 10, 8: 10, 13: 15, 15: 100, 18: 15, 23: 20, 28: 20
};

// SHC resets every 14 days from this fixed reference
const SHC_REFERENCE_DATE = new Date("2026-02-09");

function toLocalDay(value) {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Placeholder for function to compute an estimation for diamonds on a certain date (also consider wish tickets)
function estimateDiamonds(startDate, endDate, options) {
    let total = options.currentDiamonds || 0;
    let wishes = options.currentWishes || 0;
    
    const start = toLocalDay(startDate);
    const end = toLocalDay(endDate);
    
    let current = new Date(start);
    current.setDate(current.getDate() + 1); // Start counting from tomorrow

    let mondayCount = 0;
    let shcCycles = 0;

    // Loop through each day to calculate Daily and Monthly rewards accurately
    while (current <= end) {
        // 1. Daily Income (Base 50 + Aurum 100 + Gift 150)
        total += 50;
        if (options.hasAurumPass) total += 100;
        if (options.hasAurumWeekly) total += 150;

        // 2. Monthly Check-in
        const dayOfMonth = current.getDate();
        if (monthlyRewards[dayOfMonth]) {
            total += monthlyRewards[dayOfMonth];
        }

        // 3. Count Mondays for Weekly
        if (current.getDay() === 1) { // 1 is Monday
            mondayCount++;
        }

        // 4. SHC Cycles (Resets every 14 days from reference)
        const daysSinceRef = Math.floor((current - SHC_REFERENCE_DATE) / (1000 * 60 * 60 * 24));
        if (daysSinceRef % 14 === 0) {
            shcCycles++;
        }

        current.setDate(current.getDate() + 1);
    }

    // Apply Weekly Totals (Base 210 + Gift 120)
    let weeklyRate = 210; 
    if (options.hasDiamondGift) weeklyRate += 120;
    total += (mondayCount * weeklyRate);

    if (options.hasWishGift) {
        wishes += mondayCount;
    }

    // Apply SHC Rewards
    const starReward = options.starsEarned * 50; // Simplified from your script for Vue integration
    const stageReward = options.stagesCleared * 20;
    total += (shcCycles * (starReward + stageReward));

    return { totalDiamonds: total, totalWishes: wishes };
}

// Placeholder for function which tells you what packs to buy considering your budget

window.materialsApi = {
    computeNeededMaterials: computeNeededMaterials,
    savedPullsNeeded: savedPullsNeeded,
    getCurrentEXP: getCurrentEXP,
    estimateDiamonds: estimateDiamonds,
};