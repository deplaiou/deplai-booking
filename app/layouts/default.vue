<template>
  <div>
    <DemoBanner />
    <SiteHeader />
    <main>
      <div class="wrap">
        <div class="col">
          <slot />
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
