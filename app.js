const { createApp } = Vue;

createApp({
    data() {
        return {
            levelForm: {
                currentLevel: 0,
                targetLevel: 70
            },
            pullForm: {
                currentPity: 70,
                bannerType: "rerun"
            },
            expForm: {
                nBottles: 0,
                rBottles: 0,
                srBottles: 0,
                ssrBottles: 0
            },
            diamondForm: {
                currentDiamonds: 0,
                currentWishes: 0,
                targetDate: "",
                hasAurumPass: false,
                hasAurumWeekly: false,
                hasDiamondGift: false,
                hasWishGift: false,
                stagesCleared: 0,
                starsEarned: 0
            },
            levelOptions: [0, 10, 20, 30, 40, 50, 60, 70, 80],
            bannerOptions: [
                { value: "rerun", label: "Rerun" },
                { value: "solo", label: "Solo" },
                { value: "myth", label: "Myth" },
                { value: "multi", label: "Multi" },
                { value: "birthday", label: "Birthday" }
            ]
        };
    },
    computed: {
        materialResults() {
            return window.materialsApi.computeNeededMaterials(
                this.levelForm.currentLevel,
                this.levelForm.targetLevel
            );
        },
        pullResults() {
            return window.materialsApi.savedPullsNeeded(
                this.pullForm.currentPity,
                this.pullForm.bannerType
            );
        },
        currentExp() {
            return window.materialsApi.getCurrentEXP(
                this.expForm.nBottles,
                this.expForm.rBottles,
                this.expForm.srBottles,
                this.expForm.ssrBottles
            );
        },
        levelWarning() {
            return Number(this.levelForm.targetLevel) <= Number(this.levelForm.currentLevel)
                ? "Target level should be higher than the current level."
                : "";
        },
        diamondEstimation() {
            if (!this.diamondForm.targetDate) return { diamonds: 0, wishes: 0 };

            const start = new Date();
            const end = new Date(this.diamondForm.targetDate);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) return { diamonds: 0, wishes: 0 };

            return window.materialsApi.estimateDiamonds(diffDays, {
                hasAurum: this.diamondForm.hasAurum,
                hasClassic: this.diamondForm.hasClassic,
                hasDiamondGift: this.diamondForm.hasDiamondGift,
                hasWishGift: this.diamondForm.hasWishGift,
                hasPrecious: this.diamondForm.hasPrecious,
                shcStars: this.diamondForm.shcStars,
                shcClears: this.diamondForm.shcClears
            });
        },
        savingsResult() {
            if (!this.diamondForm.targetDate) return { totalDiamonds: 0, totalWishes: 0 };

            return window.materialsApi.estimateDiamonds(
                new Date(),
                new Date(this.diamondForm.targetDate),
                this.diamondForm
            );
        },
        combinedPulls() {
            const fromDiamonds = Math.floor(this.savingsResult.totalDiamonds / 150);
            return fromDiamonds + this.savingsResult.totalWishes;
        }
    },
    methods: {
        formatNumber(value) {
            return new Intl.NumberFormat().format(value);
        }
    },
    template: `
        <main class="page-shell">
            <section class="hero-card">
                <h1>Materials planner for quick Love and Deepspace checks.</h1>
            </section>

            <section class="panel-grid">
                <article class="panel">
                    <div class="panel-header">
                        <p class="panel-kicker">Upgrade</p>
                        <h2>Needed materials</h2>
                    </div>

                    <div class="field-grid">
                        <label>
                            <span>Current level</span>
                            <select v-model.number="levelForm.currentLevel">
                                <option v-for="level in levelOptions" :key="'current-' + level" :value="level">
                                    {{ level }}
                                </option>
                            </select>
                        </label>

                        <label>
                            <span>Target level</span>
                            <select v-model.number="levelForm.targetLevel">
                                <option v-for="level in levelOptions.slice(1)" :key="'target-' + level" :value="level">
                                    {{ level }}
                                </option>
                            </select>
                        </label>
                    </div>

                    <p v-if="levelWarning" class="warning">{{ levelWarning }}</p>

                    <dl class="stats-list">
                        <div>
                            <dt>EXP</dt>
                            <dd>{{ formatNumber(materialResults.EXP) }}</dd>
                        </div>
                        <div>
                            <dt>Gold</dt>
                            <dd>{{ formatNumber(materialResults.Gold) }}</dd>
                        </div>
                        <div>
                            <dt>N Crystal</dt>
                            <dd>{{ formatNumber(materialResults.N_Crystal) }}</dd>
                        </div>
                        <div>
                            <dt>R Crystal</dt>
                            <dd>{{ formatNumber(materialResults.R_Crystal) }}</dd>
                        </div>
                        <div>
                            <dt>SR Crystal</dt>
                            <dd>{{ formatNumber(materialResults.SR_Crystal) }}</dd>
                        </div>
                    </dl>
                </article>

                <article class="panel accent-panel">
                    <div class="panel-header">
                        <p class="panel-kicker">Banner</p>
                        <h2>Pulls needed to guarantee myth pair or desired 5* card</h2>
                    </div>

                    <div class="field-grid">
                        <label>
                            <span>Current pity</span>
                            <input v-model.number="pullForm.currentPity" type="number" min="0" max="70">
                        </label>

                        <label>
                            <span>Banner type</span>
                            <select v-model="pullForm.bannerType">
                                <option v-for="banner in bannerOptions" :key="banner.value" :value="banner.value">
                                    {{ banner.label }}
                                </option>
                            </select>
                        </label>
                    </div>

                    <dl class="stats-list compact">
                        <div>
                            <dt>Tickets</dt>
                            <dd>{{ formatNumber(pullResults.tickets) }}</dd>
                        </div>
                        <div>
                            <dt>Diamonds</dt>
                            <dd>{{ formatNumber(pullResults.diamonds) }}</dd>
                        </div>
                    </dl>
                </article>

                <article class="panel wide-panel">
                    <div class="panel-header">
                        <p class="panel-kicker">Inventory</p>
                        <h2>Current EXP total</h2>
                    </div>

                    <div class="field-grid bottles-grid">
                        <label>
                            <span>N Bottles</span>
                            <input v-model.number="expForm.nBottles" type="number" min="0">
                        </label>
                        <label>
                            <span>R Bottles</span>
                            <input v-model.number="expForm.rBottles" type="number" min="0">
                        </label>
                        <label>
                            <span>SR Bottles</span>
                            <input v-model.number="expForm.srBottles" type="number" min="0">
                        </label>
                        <label>
                            <span>SSR Bottles</span>
                            <input v-model.number="expForm.ssrBottles" type="number" min="0">
                        </label>
                    </div>

                    <div class="exp-total">
                        <span>Total EXP</span>
                        <strong>{{ formatNumber(currentExp) }}</strong>
                    </div>
                </article>
            <article class="panel wide-panel">
    <div class="panel-header">
        <p class="panel-kicker">Planner</p>
        <h2>Diamond Savings Estimator</h2>
    </div>

    <div class="field-grid">
        <label>
            <span>Target Date</span>
            <input type="date" v-model="diamondForm.targetDate">
        </label>
        <label>
            <span>Current Diamonds</span>
            <input type="number" v-model.number="diamondForm.currentDiamonds">
        </label>
        <label>
            <span>Current Wishes</span>
            <input type="number" v-model.number="diamondForm.currentWishes">
        </label>
        <label>
            <span>SHC Stars (Max 33)</span>
            <input type="number" v-model.number="diamondForm.starsEarned" max="33">
        </label>
                <label>
            <span>SHC Clears (Max 12)</span>
            <input type="number" v-model.number="diamondForm.stagesCleared" max="12">
        </label>
    </div>

    <div class="field-grid" style="margin-top: 15px;">
        <label class="checkbox-label">
            <input type="checkbox" v-model="diamondForm.hasAurumPass"> <span>Aurum Pass</span>
        </label>
        <label class="checkbox-label">
            <input type="checkbox" v-model="diamondForm.hasDiamondGift"> <span>Annual Weekly Diamond Gift</span>
        </label>
        <label class="checkbox-label">
            <input type="checkbox" v-model="diamondForm.hasWishGift"> <span>Annual Weekly Wish Gift</span>
        </label>
        <label class="checkbox-label" v-if="diamondForm.hasAurumPass">
            <input type="checkbox" v-model="diamondForm.hasAurumWeekly"> <span>Aurum Gift</span>
        </label>
    </div>

    <div class="exp-total">
        <span>Estimated Savings</span>
        <strong>{{ formatNumber(savingsResult.totalDiamonds) }} 💎 / {{ combinedPulls }} Pulls</strong>
    </div>
</article>
            </section>
        </main>
    `
}).mount("#app");