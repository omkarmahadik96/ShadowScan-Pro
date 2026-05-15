/**
 * Entity Resolution Engine
 * Links disparate data points (email -> username -> IP) across sources.
 */

export interface Entity {
  id: string;
  type: string;
  relationships: string[]; // IDs of related entities
}

export class EntityResolver {
  private graph: Map<string, Entity> = new Map();

  resolve(finding: any) {
    const { emails, ips, keys } = finding.normalized_data;
    
    // Simple resolution logic: if multiple entities appear in one finding, they are linked
    const entities = [...emails, ...ips, ...keys];
    
    entities.forEach(id => {
      if (!this.graph.has(id)) {
        this.graph.set(id, { id, type: 'unknown', relationships: [] });
      }
      
      const current = this.graph.get(id)!;
      entities.forEach(relatedId => {
        if (id !== relatedId && !current.relationships.includes(relatedId)) {
          current.relationships.push(relatedId);
        }
      });
    });
  }

  getGraph() {
    return Array.from(this.graph.values());
  }
}
