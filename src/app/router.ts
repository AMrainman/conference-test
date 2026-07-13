import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/features/home/views/HomeView.vue'),
    },
    {
      path: '/join',
      component: () => import('@/features/join/views/JoinView.vue'),
    },
    {
      path: '/pre-meeting/:meetingId',
      component: () => import('@/features/pre-meeting/views/PreMeetingView.vue'),
    },
    {
      path: '/waiting/:meetingId',
      component: () => import('@/features/waiting-room/views/WaitingRoomView.vue'),
    },
    {
      path: '/meeting/:meetingId',
      component: () => import('@/features/meeting-room/views/MeetingRoomView.vue'),
    },
    {
      path: '/ended/:meetingId',
      component: () => import('@/features/meeting-ended/views/MeetingEndedView.vue'),
    },
    {
      path: '/demo/:channelId',
      component: () => import('@/features/agora-demo/views/AgoraDemoView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/features/home/views/NotFoundView.vue'),
    },
  ],
})
