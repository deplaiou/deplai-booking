<script setup lang="ts">
/**
 * Owner view: /admin?key=<ADMIN_KEY>
 *
 * Deliberately unlinked and excluded from indexing; the key is the only guard.
 */
import type { AdminBooking } from '#shared/types/booking'

const { t } = useI18n()
const route = useRoute()
const key = computed(() => String(route.query.key ?? ''))

useSeoMeta({ title: () => t('admin_title'), robots: 'noindex, nofollow' })

const { data, error, pending } = await useFetch<{ bookings: AdminBooking[] }>('/api/admin/bookings', {
  query: { key },
  immediate: Boolean(key.value),
})

const bookings = computed(() => data.value?.bookings ?? [])
</script>

<template>
  <div>
    <h1>{{ t('admin_title') }}</h1>

    <p v-if="!key" class="status-line">{{ t('admin_key_missing') }}</p>
    <p v-else-if="pending" class="status-line">…</p>
    <p v-else-if="error" class="status-line error">{{ t('admin_unauthorized') }}</p>
    <p v-else-if="bookings.length === 0" class="status-line">{{ t('admin_empty') }}</p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('admin_col_when') }}</th>
            <th>{{ t('admin_col_who') }}</th>
            <th>{{ t('admin_col_topic') }}</th>
            <th>{{ t('admin_col_notes') }}</th>
            <th>{{ t('admin_col_created') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bookings" :key="item.id">
            <td class="nowrap">{{ item.date }} {{ item.time }}</td>
            <td>
              {{ item.name }}<br>
              <a :href="`mailto:${item.email}`">{{ item.email }}</a>
            </td>
            <td class="nowrap">{{ t(`topic_${item.topic}`) }}</td>
            <td>{{ item.notes || '—' }}</td>
            <td class="nowrap">{{ item.createdAt.slice(0, 16).replace('T', ' ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
