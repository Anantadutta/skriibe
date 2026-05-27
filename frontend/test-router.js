import { matchRoutes } from 'react-router-dom';

const routes = [
  { path: '/@:username', element: 'CreatorDashboard' },
  { path: '/:handle', element: 'CreatorPublicPage' }
];

const match = matchRoutes(routes, '/@anantadutta');
console.log(JSON.stringify(match, null, 2));
