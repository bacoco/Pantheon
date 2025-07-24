import { TGVSearchParams, TGVTrain, TGVSearchResult, TGV_STATIONS } from './tgv-types';

export class TGVService {
  private generateTrainNumber(): string {
    const prefix = ['TGV', 'INOUI', 'OUIGO'][Math.floor(Math.random() * 3)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix} ${number}`;
  }

  private calculateDuration(distance: number): string {
    // Approximate duration based on distance (TGV average speed ~200-300 km/h)
    const hours = Math.floor(distance / 250);
    const minutes = Math.floor((distance % 250) / 4);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }

  private calculatePrice(distance: number, travelClass: 'first' | 'second', demand: number): number {
    const basePrice = distance * 0.1; // Base price per km
    const classMultiplier = travelClass === 'first' ? 1.5 : 1;
    const demandMultiplier = 0.8 + (demand * 0.4); // Demand factor (0.8 to 1.2)
    
    return Math.round(basePrice * classMultiplier * demandMultiplier);
  }

  private getAvailability(): 'available' | 'limited' | 'sold_out' {
    const rand = Math.random();
    if (rand < 0.1) return 'sold_out';
    if (rand < 0.3) return 'limited';
    return 'available';
  }

  private generateTrains(
    departureStation: string,
    arrivalStation: string,
    date: string,
    travelClass?: 'first' | 'second'
  ): TGVTrain[] {
    const trains: TGVTrain[] = [];
    const distance = this.calculateDistance(departureStation, arrivalStation);
    
    // Generate 6-10 trains throughout the day
    const trainCount = Math.floor(Math.random() * 5) + 6;
    const startHour = 6;
    const endHour = 20;
    
    for (let i = 0; i < trainCount; i++) {
      const departureHour = startHour + Math.floor((endHour - startHour) * (i / trainCount));
      const departureMinute = Math.floor(Math.random() * 60);
      const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
      
      const duration = this.calculateDuration(distance);
      const [durationHours, durationMinutes] = duration.split('h').map(d => parseInt(d));
      const arrivalHour = departureHour + durationHours;
      const arrivalMinute = departureMinute + durationMinutes;
      const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMinute.toString().padStart(2, '0')}`;
      
      const demand = Math.random(); // Simulate demand
      
      const classes: Array<'first' | 'second'> = travelClass ? [travelClass] : ['first', 'second'];
      
      for (const cls of classes) {
        trains.push({
          trainNumber: this.generateTrainNumber(),
          departureTime,
          arrivalTime,
          duration,
          price: {
            amount: this.calculatePrice(distance, cls, demand),
            currency: 'EUR'
          },
          availability: this.getAvailability(),
          travelClass: cls,
          directTrain: Math.random() > 0.2 // 80% direct trains
        });
      }
    }
    
    return trains.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  private calculateDistance(departureId: string, arrivalId: string): number {
    // Simplified distance calculation - in real app would use actual distances
    const distanceMap: Record<string, Record<string, number>> = {
      '1': { '4': 460, '5': 780, '6': 225, '7': 570, '8': 380, '9': 490, '10': 930 }, // Paris Gare de Lyon
      '2': { '4': 460, '5': 780, '6': 225, '7': 570, '8': 380, '9': 490, '10': 930 }, // Paris Gare du Nord
      '3': { '4': 460, '5': 780, '6': 225, '7': 570, '8': 380, '9': 490, '10': 930 }, // Paris Montparnasse
      '4': { '1': 460, '5': 320, '6': 685, '7': 550, '8': 680, '9': 490, '10': 470 }, // Lyon
      '5': { '1': 780, '4': 320, '6': 1000, '7': 650, '8': 990, '9': 800, '10': 200 }, // Marseille
    };
    
    // Return distance or default
    return distanceMap[departureId]?.[arrivalId] || 
           distanceMap[arrivalId]?.[departureId] || 
           400; // Default distance
  }

  async searchTrains(params: TGVSearchParams): Promise<TGVSearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const departureStation = TGV_STATIONS.find(s => s.id === params.departureStation);
    const arrivalStation = TGV_STATIONS.find(s => s.id === params.arrivalStation);
    
    if (!departureStation || !arrivalStation) {
      throw new Error('Invalid station IDs');
    }
    
    const outboundTrains = this.generateTrains(
      params.departureStation,
      params.arrivalStation,
      params.departureDate,
      params.travelClass
    );
    
    let returnTrains: TGVTrain[] | undefined;
    if (params.returnDate) {
      returnTrains = this.generateTrains(
        params.arrivalStation,
        params.departureStation,
        params.returnDate,
        params.travelClass
      );
    }
    
    return {
      searchId: `search_${Date.now()}`,
      outbound: outboundTrains,
      return: returnTrains,
      searchParams: params,
      searchDate: new Date().toISOString()
    };
  }

  async getStations() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return TGV_STATIONS;
  }
}

export const tgvService = new TGVService();