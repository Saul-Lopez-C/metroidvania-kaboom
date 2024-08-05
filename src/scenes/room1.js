import { makeBoss } from "../entities/enemyBoss.js";
import { makeDrone } from "../entities/enemyDrone.js";
import { makeCartridge } from "../entities/healthCartridge.js";
import { makePlayer } from "../entities/player.js";
import { state } from "../state/globalStateManager.js";
import { healthBar } from "../ui/healthBar.js";
import { setBackgroundColor, setCameraControls, setCameraZones, setExitZones, setMapColliders } from "./roomUtils.js";

export function room1(k, roomData, previousSceneData) {
    setBackgroundColor(k, "#a2aed5");

    k.camScale(4);
    k.camPos(170, 100);
    k.setGravity(1000);

    const roomLayers = roomData.layers;

    const map = k.add([k.pos(), k.sprite("room1")]);
    const colliders = [];
    const positions = [];
    const cameras = [];
    const exits = [];
    for (const layer of roomLayers) {
        if (layer.name === "cameras") {
            cameras.push(...layer.objects);
        }
        
        if (layer.name === "positions") {
            positions.push(...layer.objects);
            continue;
        }

        if (layer.name === "exits") {
            exits.push(...layer.objects);
            continue;
        }

        if (layer.name === "colliders") {
            colliders.push(...layer.objects);
            continue;
        }
    }

    setMapColliders(k, map, colliders);
    setCameraZones(k, map, cameras);

    const player = map.add(makePlayer(k));
    setCameraControls(k, player, map, roomData);
    setExitZones(k, map, exits, "room2");

    for (const position of positions) {
        if (position.name === "player" && !previousSceneData.exitName) {
            player.setPosition(position.x, position.y);
            player.setControls();
            player.setEvents();
            player.enablePassthrough();
            player.respawnIfOutBounds(1000, "room1");
            continue;
        }

        if (
            position.name === "entrance-1" &&
            previousSceneData.exitName === "exit-1"
        ) {
            player.setPosition(position.x, position.y);
            player.setControls();
            player.enablePassthrough();
            player.setEvents();
            player.respawnIfOutBounds(1000, "room1");
            k.camPos(player.pos);
            continue;
        }

        if (position.type === "drone") {
            const drone = map.add(makeDrone(k, k.vec2(position.x, position.y)));
            drone.setBehaviors();
            drone.setEvents();
            continue;
        }

        if (position.name === "boss" && !state.current().isBossDefeated) {
            const boss = map.add(makeBoss(k, k.vec2(position.x, position.y)));
            boss.setBehaviors();
            boss.setEvents();
            continue;
        }

        if (position.type === "cartridge") {
            map.add(makeCartridge(k, k.vec2(position.x, position.y)));
        }
    }

    healthBar.setEvents();
    healthBar.trigger("update");
    k.add(healthBar);
}