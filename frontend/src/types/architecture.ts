export interface ArchitectureNode {
  id: string;
  name: string;
  layer: number;
  icon: string;
  purpose: string;
  responsibilities: string[];
  technologies: string[];
  apis: string[];
  dataFlow: string[];
  connections: string[];
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label: string;
}
