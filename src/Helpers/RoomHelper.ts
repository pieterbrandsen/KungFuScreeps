// @ts-ignore
import { MemoryApi } from "Api/Memory.Api";

// helper functions for rooms
export class RoomHelper {

    /**
     * check if a specified room is owned by you
     * @param room the room we want to check
     */
    public static isOwnedRoom(room: Room): boolean {

        // check if the room name is the same as any you own
        return !_.some(Game.rooms, r => r.name === room.name)
    }

    /**
     * check if a specified room is an ally room
     * @param room the room we want to check
     */
    public static isAllyRoom(room: any): boolean {

        // returns true if a room has one of our names but is not owned by us
        return (!this.isOwnedRoom(room) && (room.controller.owner.username === "Uhmbrock" || room.controller.owner.username === "Jakesboy2"))
    }

    /**
     * check if a room is a source keeper room -- IN PROGRESS
     * @param room the room we want to check
     */
    public static isSourceKeeperRoom(room: any): boolean {
        // Just do that regex thing to check, we have it in our old code
        return false;
    }

    /**
     * check if a room is a highway room -- IN PROGRESS
     * @param room the room we want to check
     */
    public static isHighwayRoom(room: any): boolean {
        return false;
    }

    /**
     * check if a room is close enough to send a creep to -- IN PROGRESS
     * @param room the room we want to check
     */
    public static inTravelRange(room: Room): boolean {
        return false;
    }

    /**
     * check if the object exists within a room
     * @param room the room we want to check
     * @param objectConst the object we want to check for
     */
    public static isExistInRoom(room: any, objectConst: StructureConstant): boolean {

        return (MemoryApi.getStructures(room,
            s => s.structureType === objectConst).length > 0);
    }

    /**
     * get the stored amount from the target
     * @param target the target we want to check the storage of
     * @param resourceType the resource we want to check the storage for
     */
    public static getStoredAmount(target: any, resourceType: ResourceConstant): number | undefined {

        if (target instanceof Creep) {
            return target.carry[resourceType];
        }
        else if (target.hasOwnProperty("store")) {
            return target.store[resourceType];
        }
        else if (resourceType === RESOURCE_ENERGY && target.hasOwnProperty("energy")) {
            return target.energy;
        }

        return -1;
    }

    /**
     * get the capacity from the target
     * @param target the target we want to check the capacity of
     */
    public static getStoredCapacity(target: any): number {

        if (target instanceof Creep) {
            return target.carryCapacity;
        }
        else if (target.hasOwnProperty("store")) {
            return target.storeCapacity;
        }
        else if (target.hasOwnProperty("energyCapacity")) {
            return target.energyCapacity;
        }

        return -1;
    }

    /**
     * get the amount of damage a tower will do at this distance
     * @param range the distance the target is from the tower
     */
    public static getTowerDamageAtRange(range: number) {
        if (range <= TOWER_OPTIMAL_RANGE) { return TOWER_POWER_ATTACK; }
        if (range >= TOWER_FALLOFF_RANGE) { range = TOWER_FALLOFF_RANGE; }
        return TOWER_POWER_ATTACK - (TOWER_POWER_ATTACK * TOWER_FALLOFF *
            (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE));
    }

    /**
     * only returns true every ${parameter} number of ticks
     * @param ticks the number of ticks you want between executions
     */
    public static excecuteEveryTicks(ticks: number): boolean {
        return Game.time % ticks === 0
    }

    /**
     * check if container mining is active in a room
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static isContainerMining(
        room: Room,
        sources: Array<Source | null>,
        containers: Array<Structure<StructureConstant> | null>): boolean {

        return false;
    }

    /**
     * check if container mining is active in a room
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static isUpgraderLink(
        room: Room,
        links: Array<Structure<StructureConstant> | null>): boolean {

        return false;
    }

    /**
     * choose an ideal target for the towers to attack
     * TODO actually choose an ideal target not just the first one lol
     * @param room the room we are in
     */
    public static chooseTowerTarget(room: Room): Creep | null {

        // get the creep we will do the most damage to
        const hostileCreeps: Array<Creep | null> = MemoryApi.getHostileCreeps(room);

        // temp, in future get one we do most dmg to
        return hostileCreeps[0];
    }
}
