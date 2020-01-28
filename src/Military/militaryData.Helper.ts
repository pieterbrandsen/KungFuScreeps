import { UserException } from "Utils/Imports/internals";

export class militaryDataHelper {

    public static getCreepAdjustedWork(creep: Creep): { harvest: number, build: number, repair: number, dismantle: number, upgradeController: number} { 

        let harvestMultiplier = 0;
        let buildMultiplier = 0;
        let repairMultiplier = 0;
        let dismantleMultiplier = 0;
        let upgradeControllerMultiplier = 0;

        _.forEach(creep.body, (part: BodyPartDefinition) => { 

            if(part.hits <= 0 || part.type !== WORK) { 
                return;
            }

            switch(part.boost) { 
                case undefined:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.U.O: 
                    harvestMultiplier += BOOSTS.work.UO.harvest;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.UO.OH:
                    harvestMultiplier += BOOSTS.work.UHO2.harvest;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.UHO2.X:
                    harvestMultiplier += BOOSTS.work.XUHO2.harvest;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.L.H:
                    harvestMultiplier += 1;
                    buildMultiplier += BOOSTS.work.LH.build;
                    repairMultiplier += BOOSTS.work.LH.repair;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.LH.OH:
                    harvestMultiplier += 1;
                    buildMultiplier += BOOSTS.work.LH2O.build;
                    repairMultiplier += BOOSTS.work.LH2O.repair;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.LH2O.X:
                    harvestMultiplier += 1;
                    buildMultiplier += BOOSTS.work.XLH2O.build;
                    repairMultiplier += BOOSTS.work.XLH2O.repair;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.Z.H:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += BOOSTS.work.ZH.dismantle;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.ZH.OH:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += BOOSTS.work.ZH2O.dismantle;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.ZH2O.X:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += BOOSTS.work.XZH2O.dismantle;
                    upgradeControllerMultiplier += 1;
                    break;
                case REACTIONS.G.H:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += BOOSTS.work.GH.upgradeController;
                    break;
                case REACTIONS.GH.OH:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += BOOSTS.work.GH2O.upgradeController;
                    break;
                case REACTIONS.GH2O.X:
                    harvestMultiplier += 1;
                    buildMultiplier += 1;
                    repairMultiplier += 1;
                    dismantleMultiplier += 1;
                    upgradeControllerMultiplier += BOOSTS.work.XGH2O.upgradeController;
                    break;
                default: throw new UserException("Error in getCreepAdjustedWork()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
            }
        });

        return { 
            harvest: harvestMultiplier,
            build: buildMultiplier,
            repair: repairMultiplier,
            dismantle: dismantleMultiplier,
            upgradeController: upgradeControllerMultiplier
        }
    }

    /**
     * Gets the attack damage adjusted for boosts
     * @param creep The creep to check
     */
    public static getCreepAdjustedAttack(creep: Creep): number { 

        let attackMultiplier = 0;

        _.forEach(creep.body, (part: BodyPartDefinition) => { 
            
            if(part.hits <= 0 || part.type !== ATTACK) { 
                return; 
            }

            switch(part.boost) { 
                case undefined: attackMultiplier += 1; break;
                case REACTIONS.U.H: attackMultiplier += BOOSTS.attack.UH.attack; break;
                case REACTIONS.UH.OH: attackMultiplier += BOOSTS.attack.UH2O.attack; break;
                case REACTIONS.UH2O.X: attackMultiplier += BOOSTS.attack.XUH2O.attack; break;
                default: throw new UserException("Error in getCreepAdjustedAttack()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
            }
        });
 
        return attackMultiplier * ATTACK_POWER;
    }

    /**
     * Gets the ranged attack damage adjusted for boosts
     * @param creep The creep to check
     * @param assumeMaxDamage If true assume max damage for rangedMassAttack, false assume min (1) damage
     */
    public static getCreepAdjustedRangedAttack(creep: Creep, assumeMaxDamage: boolean = true): { rangedAttack: number, rangedMassAttack: number } { 

        let RangedMultiplier = 0;
        let RangedMassMultiplier = 0;

        _.forEach(creep.body, (part: BodyPartDefinition) => {

            if(part.hits <= 0 || part.type !== RANGED_ATTACK) { 
                return;
            }

            switch(part.boost) { 
                case undefined: RangedMultiplier += 1; RangedMassMultiplier += 1; break;
                case REACTIONS.K.O: RangedMultiplier += BOOSTS.ranged_attack.KO.rangedAttack; RangedMassMultiplier += BOOSTS.ranged_attack.KO.rangedMassAttack; break;
                case REACTIONS.KO.OH: RangedMultiplier += BOOSTS.ranged_attack.KHO2.rangedAttack; RangedMassMultiplier += BOOSTS.ranged_attack.KHO2.rangedMassAttack; break;
                case REACTIONS.KHO2.X: RangedMultiplier += BOOSTS.ranged_attack.XKHO2.rangedAttack; RangedMassMultiplier += BOOSTS.ranged_attack.XKHO2.rangedMassAttack; break;
                default: throw new UserException("Error in getCreepAdjustedRangedAttack()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
            }

        });
        
        if(assumeMaxDamage){   
            return { rangedAttack: RangedMultiplier * RANGED_ATTACK_POWER, rangedMassAttack: RangedMassMultiplier * RANGED_ATTACK_POWER}
        } else { // assume min damage
            return { rangedAttack: RangedMultiplier * RANGED_ATTACK_POWER, rangedMassAttack: RangedMassMultiplier * 1}
        }
    }

    /**
     * @param creep The creep to check the heal capacity of
     * @return [healAmount, rangedHealAmount] - The amount of damage this creep can heal with heal() and rangedHeal() respectively
     */
    public static getCreepAdjustedHeal(creep: Creep): { heal: number, rangedHeal: number } {
        
        // Find the multiplicity of heal power.
        let healMultiplier = 0;
        let rangedHealMultiplier = 0; // Track this in case of game changes, though as of now they will always be equal

        _.forEach(creep.body, (part: BodyPartDefinition) => {
            
            if(part.hits <= 0 || part.type !== HEAL) {
                return;
            }
            
            switch (part.boost) {
                case undefined: healMultiplier += 1; rangedHealMultiplier += 1; break;
                case REACTIONS.L.O: healMultiplier += BOOSTS.heal.LO.heal; rangedHealMultiplier += BOOSTS.heal.LO.rangedHeal; break;
                case REACTIONS.LO.OH: healMultiplier += BOOSTS.heal.LHO2.heal; rangedHealMultiplier += BOOSTS.heal.LHO2.rangedHeal; break;
                case REACTIONS.X.LHO2: healMultiplier += BOOSTS.heal.XLHO2.heal; rangedHealMultiplier += BOOSTS.heal.XLHO2.rangedHeal; break;
                default: throw new UserException("Error in getCreepAdjustedHeal()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
            }

        });

        return { heal: HEAL_POWER * healMultiplier,
                 rangedHeal: RANGED_HEAL_POWER * rangedHealMultiplier }
    }

    /**
     * Gets the adjusted creep carry capacity, taking boosts into consideration
     * @param creep The creep to check
     * @returns Total carry capacity for the creep
     */
    public static getCreepAdjustedCarry(creep: Creep): number { 

        let carryCapacity = 0;

        _.forEach(creep.body, (part: BodyPartDefinition) => { 
            
            if(part.hits < 0 || part.type !== CARRY) { 
                return;
            }

            switch(part.boost) {
                case undefined: carryCapacity += CARRY_CAPACITY; break;
                case REACTIONS.K.H: carryCapacity += BOOSTS.carry.KH.capacity * CARRY_CAPACITY; break;
                case REACTIONS.KH.OH: carryCapacity += BOOSTS.carry.KH2O.capacity * CARRY_CAPACITY; break;
                case REACTIONS.KH2O.X: carryCapacity += BOOSTS.carry.XKH2O.capacity * CARRY_CAPACITY; break;
                default: throw new UserException("Error in getCreepAdjustedCarry()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
            }

        });

        return carryCapacity;
    }

    /**
     * Returns the number of fatigue removed per tick 
     * @param creep The creep to check
     */
    public static getCreepAdjustedMove(creep: Creep): number { 

        let fatiguePerMove = 0;

        _.forEach(creep.body, (part: BodyPartDefinition) => { 
            if(part.hits <= 0 || part.type !== MOVE ) { 
                return;
            }

            switch(part.boost){
                case undefined: fatiguePerMove += 1; break;
                case REACTIONS.Z.O: fatiguePerMove += BOOSTS.move.ZO.fatigue; break;
                case REACTIONS.ZO.OH: fatiguePerMove += BOOSTS.move.ZHO2.fatigue; break;
                case REACTIONS.ZHO2.X: fatiguePerMove += BOOSTS.move.XZHO2.fatigue; break;
                default: throw new UserException("Error in getCreepAdjustedMove()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
            }

        });

        return fatiguePerMove;
    }

    /**
     * Returns the total HP for the creep, adjusted for the damage reduction from tough parts. 
     * @param creep The creep to check
     * @returns The creep's adjusted HP
     */
    public static getCreepToughAdjustedHP(creep: Creep): number { 

        // Find the multiplicity of damage taken
        let totalAdjustedHealth = 0;

        _.forEach(creep.body, (part: BodyPartDefinition) => {

            if(part.hits <= 0) {
                return;
            }

            if(part.type === TOUGH) {
                switch (part.boost) { 
                    case undefined: totalAdjustedHealth += part.hits; break;
                    case REACTIONS.G.O: totalAdjustedHealth += part.hits * BOOSTS.tough.GO.damage; break;
                    case REACTIONS.GO.OH: totalAdjustedHealth += part.hits * BOOSTS.tough.GHO2.damage; break;
                    case REACTIONS.GHO2.X: totalAdjustedHealth += part.hits * BOOSTS.tough.XGHO2.damage; break;
                    default: throw new UserException("Error in getCreepToughAdjustedHP()", "Unable to find the correct boost affect. Ensure that the proper reactions are being checked.", ERROR_ERROR);
                }
            } else {
                totalAdjustedHealth += part.hits;
            }
        });

        return totalAdjustedHealth;
    }
}