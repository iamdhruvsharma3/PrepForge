export class HealthRepository {
  private readonly startedAt = new Date();

  getStartedAt(): Date {
    return this.startedAt;
  }
}

