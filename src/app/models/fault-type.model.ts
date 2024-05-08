export class FaultType {
    id: number;
    type: string;
    isSuccess: number;
    
    constructor(id: number, type: string, isSuccess: number) {
      this.id = id;
      this.type = type;
      this.isSuccess = isSuccess;
    }
  }
  