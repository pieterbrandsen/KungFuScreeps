import RoomHelper from "../Helpers/RoomHelper";
import MemoryHelper from "../Helpers/MemoryHelper";
import MemoryHelperRoom from "../Helpers/MemoryHelper_Room";
import MemoryApi from "./Memory.Api";
import CreepDomestic from "./CreepDomestic.Api";
import { ROLE_REMOTE_RESERVER, ROLE_REMOTE_MINER } from "utils/Constants";
import UtilHelper from "Helpers/UtilHelper";
import MemoryHelper_Room from "../Helpers/MemoryHelper_Room";

/**
 * The API used by the spawn manager
 */
export default class SpawnApi {
    /**
     * Get count of all creeps, or of one if creepConst is specified
     * @param room the room we are getting the count for
     * @param creepConst [Optional] Count only one role
     */
    public static getCreepCount(room: Room, creepConst?: RoleConstant): number {
        const filterFunction = creepConst === undefined ? undefined : (c: Creep) => c.memory.role === creepConst;
        return MemoryApi.getMyCreeps(room, filterFunction).length;
    }

    /**
     * get creep limits
     * @param room the room we want the limits for
     */
    public static getCreepLimits(room: Room): CreepLimits {
        const creepLimits: CreepLimits = {
            domesticLimits: Memory.rooms[room.name].creepLimit["remoteLimits"],
            remoteLimits: Memory.rooms[room.name].creepLimit["remoteLimits"],
            militaryLimits: Memory.rooms[room.name].creepLimit["militaryLimits"]
        };

        return creepLimits;
    }

    /**
     * set domestic creep limits
     * @param room the room we want limits for
     */
    public static generateDomesticCreepLimits(room: Room): DomesticCreepLimits {
        const domesticLimits: DomesticCreepLimits = {
            miner: 0,
            harvester: 0,
            worker: 0,
            powerUpgrader: 0,
            lorry: 0
        };

        // check what room state we are in
        switch (room.memory.roomState) {
            // Intro
            case ROOM_STATE_INTRO:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 1;
                domesticLimits[ROLE_HARVESTER] = 1;
                domesticLimits[ROLE_WORKER] = 1;

                break;

            // Beginner
            case ROOM_STATE_BEGINNER:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 4;
                domesticLimits[ROLE_HARVESTER] = 4;
                domesticLimits[ROLE_WORKER] = 4;

                break;

            // Intermediate
            case ROOM_STATE_INTER:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 2;
                domesticLimits[ROLE_HARVESTER] = 3;
                domesticLimits[ROLE_WORKER] = 5;

                break;

            // Advanced
            case ROOM_STATE_ADVANCED:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 2;
                domesticLimits[ROLE_HARVESTER] = 2;
                domesticLimits[ROLE_WORKER] = 4;
                domesticLimits[ROLE_POWER_UPGRADER] = 0;
                domesticLimits[ROLE_LORRY] = 0;

                break;

            // Upgrader
            case ROOM_STATE_UPGRADER:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 2;
                domesticLimits[ROLE_HARVESTER] = 2;
                domesticLimits[ROLE_WORKER] = 2;
                domesticLimits[ROLE_POWER_UPGRADER] = 1;

                break;

            // Stimulate
            case ROOM_STATE_STIMULATE:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 2;
                domesticLimits[ROLE_HARVESTER] = 3;
                domesticLimits[ROLE_WORKER] = 3;
                domesticLimits[ROLE_POWER_UPGRADER] = 2;
                domesticLimits[ROLE_LORRY] = 2;

                break;

            // Seige
            case ROOM_STATE_SEIGE:
                // Domestic Creep Definitions
                domesticLimits[ROLE_MINER] = 2;
                domesticLimits[ROLE_HARVESTER] = 3;
                domesticLimits[ROLE_WORKER] = 2;
                domesticLimits[ROLE_LORRY] = 1;

                break;
        }

        // Return the limits
        return domesticLimits;
    }

    /**
     * set remote creep limits
     * TODO - get remote defender to roll thru on call --
     * ! ^^ Did I complete this? ^^
     * (we got shooters on deck)
     * @param room the room we want limits for
     */
    public static generateRemoteCreepLimits(room: Room): RemoteCreepLimits {
        const remoteLimits: RemoteCreepLimits = {
            remoteMiner: 0,
            remoteHarvester: 0,
            remoteReserver: 0,
            remoteColonizer: 0,
            remoteDefender: 0
        };

        const numRemoteRooms: number = RoomHelper.numRemoteRooms(room);
        const numClaimRooms: number = RoomHelper.numClaimRooms(room);

        // If we do not have any remote rooms, return the initial remote limits (Empty)
        if (numRemoteRooms <= 0 && numClaimRooms <= 0) {
            return remoteLimits;
        }

        // Gather the rest of the data only if we have a remote room or a claim room
        const numRemoteDefenders = RoomHelper.numRemoteDefenders(room);
        const numRemoteSources: number = RoomHelper.numRemoteSources(room);

        // check what room state we are in
        switch (room.memory.roomState) {
            // Advanced
            case ROOM_STATE_ADVANCED:
                // 1 'Squad' per source (harvester and miner) and a reserver
                // Remote Creep Definitions
                remoteLimits[ROLE_REMOTE_MINER] = numRemoteSources;
                remoteLimits[ROLE_REMOTE_HARVESTER] = numRemoteSources;
                remoteLimits[ROLE_REMOTE_RESERVER] = numRemoteRooms;
                remoteLimits[ROLE_COLONIZER] = numClaimRooms;
                remoteLimits[ROLE_REMOTE_DEFENDER] = numRemoteDefenders;

                break;

            // Upgrader
            case ROOM_STATE_UPGRADER:
                // 1 'Squad' per source (harvester and miner) and a reserver
                // Remote Creep Definitions
                remoteLimits[ROLE_REMOTE_MINER] = numRemoteSources;
                remoteLimits[ROLE_REMOTE_HARVESTER] = numRemoteSources;
                remoteLimits[ROLE_REMOTE_RESERVER] = numRemoteRooms;
                remoteLimits[ROLE_COLONIZER] = numClaimRooms;
                remoteLimits[ROLE_REMOTE_DEFENDER] = numRemoteDefenders;

                break;

            // Stimulate
            case ROOM_STATE_STIMULATE:
                // 1 'Squad' per source (harvester and miner) and a reserver
                // Remote Creep Definitions
                remoteLimits[ROLE_REMOTE_MINER] = numRemoteSources;
                remoteLimits[ROLE_REMOTE_HARVESTER] = numRemoteSources;
                remoteLimits[ROLE_REMOTE_RESERVER] = numRemoteRooms;
                remoteLimits[ROLE_COLONIZER] = numClaimRooms;
                remoteLimits[ROLE_REMOTE_DEFENDER] = numRemoteDefenders;

                break;
        }

        // Return the limits
        return remoteLimits;
    }

    /**
     * set military creep limits
     * @param room the room we want limits for
     */
    public static generateMilitaryCreepLimits(room: Room): MilitaryCreepLimits {
        const militaryLimits: MilitaryCreepLimits = {
            zealot: 0,
            stalker: 0,
            medic: 0
        };

        // Check for attack flags and adjust accordingly

        // Check if we need defenders and adjust accordingly

        // Return the limits
        return militaryLimits;
    }

    /**
     * set creep limits for the room
     * @param room the room we are setting limits for
     */
    public static setCreepLimits(room: Room): void {
        // Set Domestic Limits to Memory
        MemoryHelperRoom.updateDomesticLimits(room, this.generateDomesticCreepLimits(room));

        // Set Remote Limits to Memory
        MemoryHelperRoom.updateRemoteLimits(room, this.generateRemoteCreepLimits(room));

        // Set Military Limits to Memory
        MemoryHelperRoom.updateMilitaryLimits(room, this.generateMilitaryCreepLimits(room));
    }

    /**
     * get the first available open spawn for a room
     * @param room the room we are checking the spawn for
     */
    public static getOpenSpawn(room: Room): Structure<StructureConstant> | null {
        // get all spawns then just take the first one from it
        const allSpawns: Array<Structure<StructureConstant> | null> = MemoryApi.getStructures(
            room,
            (s: Structure<StructureConstant>) => s.structureType === STRUCTURE_SPAWN
        );

        //// not sure about this one, i read that _.first ONLY works on arrays and will NOT work on objects
        //// allSpawns[0] might be needed... just so we have solution if this ends up being a bug later lol
        //// i mean i could just change it to be safe but then nobody would read this
        //// so im just gonna leave it
        // MemoryApi.getStructures returns an array of objects, so _.first will be fine
        return _.first(allSpawns);
    }

    /**
     * get next creep to spawn
     * ? Should we declare the RolePriority lists in Constants.ts or keep them local?
     * @param room the room we want to spawn them in
     */
    public static getNextCreep(room: Room): string | null {

        // ! Keep this list ordered by spawn priority
        const domesticRolePriority: RoleConstant[] = [
            ROLE_MINER,
            ROLE_HARVESTER,
            ROLE_WORKER,
            ROLE_POWER_UPGRADER,
            ROLE_LORRY
        ];

        // ! Keep this list ordered by spawn priority
        const remoteRolePriority: RoleConstant[] = [
            ROLE_REMOTE_RESERVER,
            ROLE_REMOTE_MINER,
            ROLE_REMOTE_HARVESTER,
            ROLE_REMOTE_DEFENDER,
            ROLE_COLONIZER
        ];

        // ! Keep this list ordered by spawn priority
        const militaryRolePriority: RoleConstant[] = [
            ROLE_MEDIC,
            ROLE_STALKER,
            ROLE_ZEALOT
        ];

        // Get Limits for each creep department
        const creepLimits: CreepLimits = this.getCreepLimits(room);

        // Check if we need a domestic creep -- Return role if one is found
        for (const role of domesticRolePriority) {
            if (this.getCreepCount(room, role) < creepLimits.domesticLimits[role]) {
                return role;
            }
        }
        // Check if we need a military creep -- Return role if one is found
        for (const role of militaryRolePriority) {
            if (this.getCreepCount(room, role) < creepLimits.militaryLimits[role]) {
                return role;
            }
        }
        // Check if we need a remote creep -- Return role if one is found
        for (const role of remoteRolePriority) {
            if (this.getCreepCount(room, role) < creepLimits.remoteLimits[role]) {
                return role;
            }
        }
        
        // Return null if we don't need to spawn anything
        return null;
    }

    /**
     * spawn the next creep
     * @param room the room we want to spawn them in
     * @param BodyPartConstant[] the body array of the creep
     * @param RoleConstant the role of the creep
     */
    public static spawnNextCreep(room: Room): void {
        // brock hates empty blocks
    }

    /**
     * get energy cost of creep
     * @param room the room we are spawning them in
     * @param RoleConstant the role of the creep
     * @param tier the tier of this creep we are spawning
     */
    public static getEnergyCost(room: Room, roleConst: RoleConstant, tier: number): number {
        return 1;
    }

    /**
     * check what tier of this creep we are spawning
     * @param room the room we are spawning them in
     * @param RoleConstant the role of the creep
     */
    public static getTier(room: Room, roleConst: RoleConstant): number {
        return 1;
    }

    /**
     * get the memory options for this creep
     * @param room the room we are spawning it in
     * @param RoleConstant the role of the creep
     * @param tier the tier of this creep we are spawning
     */
    private static generateCreepOptions(room: Room, roleConst: RoleConstant, tier: number): void {
        // .keep
    }

    /**
     * generate a body for creeps given a specific set of paramters
     * @param
     */
    private static generateCreepBody(parts: BodyPartConstant[], numEach: number[]): BodyPartConstant[] {
        // Ensure that the arrays are of equal size
        if (parts.length !== numEach.length) {
            UtilHelper.throwError(
                "Invalid parameters",
                "GenerateCreepBody was passed 2 differing array sizes",
                ERROR_ERROR
            );
            throw new Error("Body part and number of part part arrays are not of equal length.");
        }

        let creepBody: BodyPartConstant[] = [];
        let size: number = parts.length;

        // Loop over the parts and push the associated amount of parts onto the array
        for (let i = 0; i < size; ++i) {
            let currentPart: BodyPartConstant = parts[i];
            let currentCount: number = numEach[i];

            for (let j = 0; j < currentCount; ++j) {
                creepBody.push(currentPart);
            }
        }

        return creepBody;
    }

    /**
     * check if our remote room needs a remote defender
     * @param room the home room associated with the remote room
     */
    private static needRemoteDefender(room: Room): boolean {
        return false;
    }

    /**
     * get the number of active miners
     * ie miners with more than 50 TTL
     * @param room the room we are checking in
     */
    private static getActiveMiners(room: Room): number {
        // all miners with more than 50 TTL
        return 1;
    }
}
