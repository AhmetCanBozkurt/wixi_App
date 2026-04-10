import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: number;
  title: string;
  description?: string;
  clientName?: string;
  imageUrl?: string;
  href?: string;
}

const ProjectCard = ({ id, title, description, clientName, imageUrl, href }: ProjectCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {clientName && <CardDescription>{clientName}</CardDescription>}
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </CardContent>
      )}
      {href && (
        <CardFooter>
          <Button variant="ghost" asChild className="w-full">
            <Link to={href}>
              Detaylar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProjectCard;

