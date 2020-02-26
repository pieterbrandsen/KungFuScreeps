import { UserException, MemoryApi_Room, RoomHelper_Structure } from "Utils/Imports/internals";

/**
 * This file creates and stores all cost matrices in a global context so that they are only created on demand
 * and only if they have not been created on the current global heap
 */
export class CostMatrixApi {
    public static costMatrices: CostMatrixIndex = {};

    /**
     * Gets the tower damage at each tile in the room, displays as 1% of the total value to avoid slowing pathfinder down
     * @param roomName Room to get the damage for - REQUIRES ROOM VISION
     */
    public static getTowerDamageMatrix(roomName: string): CostMatrix {
        if (this.costMatrices[roomName] === undefined) {
            this.costMatrices[roomName] = {};
        }

        const roomCostMatrices: RoomCostMatrices = this.costMatrices[roomName];

        if (
            roomCostMatrices.towerDamageMatrix &&
            (roomCostMatrices.towerDamageMatrix.expires === false ||
                (roomCostMatrices.towerDamageMatrix.expires === true &&
                    roomCostMatrices.towerDamageMatrix.expirationTick! > Game.time))
        ) {
            return this.deserializeStoredCostMatrix(roomCostMatrices.towerDamageMatrix);
        }

        if (Game.rooms[roomName] === undefined) {
            throw new UserException(
                "Unable to getTowerDamageMatrix for room " + roomName,
                "We do not have vision on the room to calculate the damage.",
                ERROR_ERROR
            );
        }

        const structures: Structure[] = Game.rooms[roomName].find(FIND_STRUCTURES) as Structure[];
        const towers: StructureTower[] = _.filter(
            structures,
            (struct: Structure) => struct.structureType === STRUCTURE_TOWER
        ) as StructureTower[];
        const newTowerDamageMatrix: CostMatrix = new PathFinder.CostMatrix();

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                let damage = 0;

                _.forEach(towers, (tower: StructureTower) => {
                    damage += RoomHelper_Structure.getTowerDamageAtRange(tower.pos.getRangeTo(x, y));
                });

                // Only set to 1% of damage so that it does not cap out (255) easily
                newTowerDamageMatrix.set(x, y, damage * 0.01);
            }
        }

        roomCostMatrices.towerDamageMatrix = this.serializeCostMatrix(
            newTowerDamageMatrix,
            roomName,
            true,
            Game.time + 5000 // TODO Move this value to a config file
        );
        return newTowerDamageMatrix;
    }

    /**
     * Gets the base terrain values - 1 = Plain, 5 = Swamp
     * @param roomName The room to check - DOES NOT REQUIRE VISION
     */
    public static getTerrainMatrix(roomName: string): CostMatrix {
        if (this.costMatrices[roomName] === undefined) {
            this.costMatrices[roomName] = {};
        }

        const roomCostMatrices: RoomCostMatrices = this.costMatrices[roomName];

        if (
            roomCostMatrices.terrainMatrix &&
            (roomCostMatrices.terrainMatrix.expires === false ||
                (roomCostMatrices.terrainMatrix.expires === true &&
                    roomCostMatrices.terrainMatrix.expirationTick! > Game.time))
        ) {
            return this.deserializeStoredCostMatrix(roomCostMatrices.terrainMatrix);
        }

        const terrain: RoomTerrain = new Room.Terrain(roomName);
        const newTerrainMatrix = new PathFinder.CostMatrix();

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                const terrainType = terrain.get(x, y);
                const terrainWeight = terrainType === 0 ? 1 : terrainType === 1 ? 255 : 5;
                newTerrainMatrix.set(x, y, terrainWeight);
            }
        }

        this.costMatrices[roomName].terrainMatrix = this.serializeCostMatrix(newTerrainMatrix, roomName, false);
        return newTerrainMatrix;
    }

    /**
     * Converts a StoredCostMatrix to a CostMatrix then calls VisualizeCostMatrix
     * @param storedMatrix Any StoredCostMatrix to visualize
     * @param highlightLowValue The lower normal limit - Items below this will be highlighted yellow
     * @param highlightHighValue The upper normal limit - Items above this will be highlighted red
     */
    public static visualizeStoredMatrix(
        storedMatrix: StoredCostMatrix,
        highlightLowValue?: number,
        highlightHighValue?: number
    ) {
        const costMatrix = this.deserializeStoredCostMatrix(storedMatrix);
        this.visualizeCostMatrix(costMatrix, storedMatrix.roomName, highlightLowValue, highlightHighValue);
    }

    /**
     * Displays the values of a cost matrix on the room the matrix is for
     * @param costMatrix Any cost matrix to be visualized
     * @param highlightLowValue The lower normal limit - Items below this will be highlighted yellow
     * @param highlightHighValue The upper normal limit - Items above this will be highlighted red
     */
    public static visualizeCostMatrix(
        costMatrix: CostMatrix,
        roomName: string,
        highlightLowValue?: number,
        highlightHighValue?: number
    ) {
        const roomVisual = new RoomVisual(roomName);

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                const visualStyle: TextStyle = {
                    color: "#ffffff",
                    font: 0.5,
                    backgroundPadding: 0.09,
                    opacity: 0.25,
                    backgroundColor: undefined
                };

                const value: number = costMatrix.get(x, y);

                if (highlightHighValue && value > highlightHighValue) {
                    visualStyle.backgroundColor = "#CC1100";
                    visualStyle.opacity = 0.4;
                }

                if (highlightLowValue && value < highlightLowValue) {
                    visualStyle.backgroundColor = "#FFD300";
                    visualStyle.opacity = 0.4;
                }

                roomVisual.text(value.toString(), x, y, visualStyle);
            }
        }
    }

    public static serializeCostMatrix(
        costMatrix: CostMatrix,
        roomName: string,
        expires: boolean,
        expirationTick?: number
    ): StoredCostMatrix {
        const storedMatrix: StoredCostMatrix = {
            roomName,
            serializedCostMatrix: JSON.stringify(costMatrix.serialize()),
            expires,
            expirationTick
        };

        return storedMatrix;
    }
    /**
     * Deserializes a cost matrix from memory
     * @param storedMatrix Any stored cost matrix to deserialize
     */
    public static deserializeStoredCostMatrix(storedMatrix: StoredCostMatrix): CostMatrix {
        const parsedMatrix: number[] = JSON.parse(storedMatrix.serializedCostMatrix);
        return PathFinder.CostMatrix.deserialize(parsedMatrix);
    }

    /**
     * Reduces an array to make the minimum value in the range 1 (e.g. 4-20 will reduce to 1-17)
     * @param costMatrix Cost matrix to reduce to 1 based
     */
    public static reduceCostMatrix(costMatrix: CostMatrix): CostMatrix {

        const reducedMatrix = new PathFinder.CostMatrix();

        const offset = 1 - _.min(costMatrix.serialize());

        // Return early if matrix is already 1-based
        if(offset === 0) {
            return costMatrix;
        }

        for(let x = 0; x < 50; x++) {
            for(let y = 0; y < 50; y++) {

                const currValue: number = costMatrix.get(x, y);
                reducedMatrix.set(x, y, currValue - offset);

            }
        }

        return reducedMatrix;
    }

    /**
     * Converts a cost matrix of any range of values to 1-scale. Any 255 values will remain 255
     * @param costMatrix Cost matrix to scale
     * @param scaleMax Max value of the scale
     */
    public static scaleCostMatrix(costMatrix: CostMatrix, scaleMax: number): CostMatrix {

        const scaledMatrix = new PathFinder.CostMatrix();

        // +1 to make scale 1 based instead of zero based
        const range = 1 + _.max(costMatrix.serialize()) - _.min(costMatrix.serialize())
        
        const valueScale = scaleMax / range;

        for(let x = 0; x < 50; x++) {
            for(let y = 0; y < 50; y++) {

                const scaledValue = costMatrix.get(x, y) * valueScale;
                scaledMatrix.set(x, y, scaledValue);

            }
        }

        return scaledMatrix;
    }

    /**
     * Sums any number of costMatrices
     * @param costMatrices An array of costmatrices to sum
     */
    public static sumCostMatrices(costMatrices: CostMatrix[]): CostMatrix {

        const resultMatrix = new PathFinder.CostMatrix();

        for(let x = 0; x < 50; x++) {
            for(let y = 0; y < 50; y++) {

                let summedValue = 0;

                for(let i = 0; i < costMatrices.length; i++) {

                    summedValue += costMatrices[i].get(x, y);

                }

                resultMatrix.set(x, y, summedValue);
            }
        }

        return resultMatrix;
    }
}