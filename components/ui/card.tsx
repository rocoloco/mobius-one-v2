import { Card as HeroCard, CardBody, CardHeader, CardFooter } from '@heroui/react';

export const Card = HeroCard;
export { CardBody, CardHeader, CardFooter };

// Alias components for compatibility with other UI libraries
export const CardContent = CardBody;
export const CardTitle = ({ children, ...props }: any) => <h3 {...props}>{children}</h3>;
export const CardDescription = ({ children, ...props }: any) => <p {...props}>{children}</p>;

export default Card;