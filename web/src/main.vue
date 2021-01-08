<template>
    <v-app align-center class="root pt-4">
        <game
            v-if="remote.state == 2"
            :color="remote.color"
            :board="remote.board"
            :history="remote.history"
            v-model:last-move="lastMove"
            @input="remote.move"
        >
            <template v-slot:actions v-if="remote.state == 2 && result">
                <v-flex align-center justify-center class="pb-4">
                    <v-text title class="mr-4">
                        <span v-if="result == 'statemate'">Stalemate</span>
                        <span v-else-if="result == 'w'">Black wins</span>
                        <span v-else-if="result == 'b'">White wins</span>
                    </v-text>

                    <v-button color="primary" @click="remote.reset()">
                        <span>new game</span>
                    </v-button>
                </v-flex>
            </template>
        </game>

        <local-game v-else>
            <template v-slot:actions>
                <v-flex
                    v-if="remote.state == 1"
                    align-center
                    justify-center
                    class="pb-4"
                >
                    <v-button
                        icon
                        @click="copyLink()"
                        @mouseleave="linkCopied = false"
                    >
                        <v-icon v-if="!linkCopied">content_paste</v-icon>
                        <v-icon v-else bold style="color: #4caf50"
                            >check</v-icon
                        >
                    </v-button>

                    <v-text-field
                        class="mt-0 ml-4"
                        ref="linkInput"
                        solo
                        :model-value="link"
                    />
                </v-flex>
            </template>
        </local-game>
    </v-app>
</template>

<script >
import { computed, inject, ref } from 'vue';

import { Rules } from './chess';

import game from './ui/game';
import localGame from './ui/local-game';

export default {
    name: 'chess',
    components: {
        game,
        localGame,
    },

    setup(props) {
        let remote = inject('remote');

        let lastMove = ref(null);
        let result = computed(() => {
            if (Rules.all_legal_moves(remote.board).size > 0)
                return null;

            return Rules.check(remote.board) ?? 'statemate';
        });

        let link = computed(() => `${location.origin}${location.pathname}#${remote.code}`);
        let linkInput = ref(null);
        let linkCopied = ref(false);

        return {
            remote,
            lastMove, result,

            link, linkInput, linkCopied,
            copyLink: () => {
                linkInput.value.select();
                document.execCommand('copy');
                linkCopied.value = true;
            }
        };
    },
};
</script>

<style lang="scss">
html,
body {
    margin: 0;
}

#app {
    width: 100vw;
    height: 100vh;
    display: flex;
    // align-items: center;
    justify-content: center;
}
</style>

<style lang="scss" scoped>
.root {
    overflow: hidden;
}
</style>
