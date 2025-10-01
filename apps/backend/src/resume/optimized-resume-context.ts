export class OptimizedResumeContext {
  private _summary: string;
  private _workExperiences: string;
  private _skills;

  setSummary(summary: string) {
    this._summary = summary;
  }

  setWorkExperiences(workExperiences: string) {
    this._workExperiences = workExperiences;
  }

  setSkills(skills: string) {
    this._skills = skills;
  }

  get summary() {
    return this._summary;
  }

  get workExperiences() {
    return this._workExperiences;
  }

  get skills() {
    return this._skills;
  }
}
