<script>
  import { onMount } from 'svelte';

  let raindrops = $state([]);
  let glitter = $state([]);
  let discordId = $state('');
  let resultMessage = $state('');
  let resultColor = $state('');

  const validIds = ['1346646019693215744', '1385734267627245569'];
  const oldIds = ['1334528441445257318', '1326545308657782828', '1310761016144957461', '1314010017459863582'];

  function checkDiscordId() {
    if (validIds.includes(discordId)) {
      resultMessage = 'THIS IS ME';
      resultColor = 'text-green-500';
    } else if (oldIds.includes(discordId)) {
      resultMessage = 'THIS IS OLD LOL';
      resultColor = 'text-yellow-500';
    } else {
      resultMessage = 'THIS IS NOT ME :(';
      resultColor = 'text-red-500';
    }
  }

  onMount(() => {
    const createRain = () => {
      raindrops = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 1 + Math.random() * 2
      }));
    };

    const createGlitter = () => {
      glitter = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2
      }));
    };

    createRain();
    createGlitter();
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-950 relative overflow-hidden flex flex-col items-center justify-center">
  <!-- Rain effect -->
  {#each raindrops as drop (drop.id)}
    <div
      class="rain-drop"
      style="left: {drop.left}%; animation-delay: {drop.delay}s; animation-duration: {drop.duration}s;"
    ></div>
  {/each}

  <!-- Glitter effect -->
  {#each glitter as sparkle (sparkle.id)}
    <div
      class="glitter-sparkle"
      style="left: {sparkle.left}%; top: {sparkle.top}%; animation-delay: {sparkle.delay}s; animation-duration: {sparkle.duration}s;"
    ></div>
  {/each}

  <!-- Moved heading completely outside and above the GUI container -->
  <h1 class="relative z-10 text-5xl font-bold text-center mb-8 text-white">
    I AM <span class="text-blue-400 italic">TAY</span>
  </h1>

  <!-- Discord ID Checker -->
  <div class="relative z-10 container mx-auto px-6 max-w-2xl">
    <div class="bg-slate-900/20 backdrop-blur-sm border border-slate-700/30 rounded-lg p-8">
      <!-- Added text-white to label -->
      <label for="discord-id" class="block text-lg font-semibold mb-4 text-white">
        Enter Discord ID:
      </label>
      <input
        id="discord-id"
        type="text"
        bind:value={discordId}
        placeholder="Paste Discord ID here..."
        class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />
      <!-- Made button more transparent with 10% opacity and light blue outline -->
      <button
        onclick={checkDiscordId}
        class="w-full bg-blue-600/10 hover:bg-blue-700/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors backdrop-blur-sm border border-blue-400/50"
      >
        Check ID
      </button>

      <div class="mt-4 text-center text-sm text-slate-300">
        <p>YO I lowkey be getting banned ALOT, I will ALWAYS have my updated discord here twin</p>
      </div>

      {#if resultMessage}
        <div class="mt-6 text-center">
          <p class="text-2xl font-bold {resultColor}">
            {resultMessage}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .rain-drop {
    position: absolute;
    top: -100px;
    width: 2px;
    height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(147, 197, 253, 0.6), transparent);
    animation: rain linear infinite;
    pointer-events: none;
  }

  .glitter-sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(147, 197, 253, 0.8);
    border-radius: 50%;
    animation: twinkle ease-in-out infinite;
    pointer-events: none;
    box-shadow: 0 0 6px rgba(147, 197, 253, 0.8);
  }

  @keyframes rain {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0);
    }
    50% {
      opacity: 1;
      transform: scale(1.5);
    }
  }
</style>
