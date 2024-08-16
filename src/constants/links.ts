/**
 * The links array contains the links that will be displayed in the navigation bar.
 */
export const links = [
  { to: '/', text: 'Home' },
  { to: '/projects', text: 'Projects' },
  { to: '/resume', text: 'Resume' },
  { to: '/contact', text: 'Contact' },
];

export type Links = typeof links;

export type Link = Links[number];
