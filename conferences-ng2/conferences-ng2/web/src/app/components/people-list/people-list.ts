import {Component, OnInit} from 'angular2/core';
import {WakandaService} from '../../services/wakanda';

@Component({
  selector: 'people-list',
  styles: [require('./people-list.scss')],
  template: require('./people-list.html')
})
export class PeopleList implements OnInit {
  
  public peopleList: any[];
  public currentPeople: any;
  public newPerson: string;
  private conferences: any[];
  public currentPeopleAvailableConf: any[];
  public currentPeopleConfToRegister: any;
  
  constructor(private _wakandaService: WakandaService) {
    this.peopleList = [];
    this.currentPeople = null;
    this.newPerson = null;
    this.conferences = [];
    this.currentPeopleAvailableConf = [];
    this.currentPeopleConfToRegister = null;
  }
  
  public clickOnPeople(p) {
    this.currentPeople = p;
    this.getAvailableConferences(p);
  }
  
    
  public addPeople() {
    if (this.newPerson) {
      this._wakandaService.catalog.then(c => {
        let person = c['Person'].create({
          name: this.newPerson
        });
        
        person.save().then(() => {
          this.newPerson = null;
          this.loadPersons();
        });
      });
    }
  }
  
  ngOnInit() {
    this.loadPersons();
  }
  
  
  private loadPersons() {
    this._wakandaService.catalog.then(c => {
      c['Person'].query({select: 'conferences', orderBy: 'name'}).then(collection => {
        this.peopleList = collection.entities; 
      });
    });
  }
  
  private getAllConferences() {
    if (this.conferences.length === 0) {
      return this._wakandaService.catalog.then(c => {
        return c['Conference'].query({orderBy: 'name'}).then(col => {
          this.conferences = col.entities;
          return col.entities 
        });
      });
    }
    
    return Promise.resolve(this.conferences);
  }
  
  private getAvailableConferences(people: any) {
    console.log('1423');
    
    this.getAllConferences().then(conferences => {
      this.currentPeopleAvailableConf = conferences.filter((conf: any) => {
        return !this.isRegisterToConf(people, conf.name);
      });
      this.currentPeopleConfToRegister = this.currentPeopleAvailableConf[0];
    });
    
  }
  
  private isRegisterToConf(people: any, confName: string) {
    for (let c of people.conferences.entities) {
      if (c.name === confName) {
        return true;
      }
    }
    return false;
  }
  
  public registerToConference() {
    if (this.currentPeopleConfToRegister) {
      this._wakandaService.catalog.then(c => {
        let attended = c['Attended'].create({
          person: this.currentPeople,
          conference: this.currentPeopleConfToRegister
        });
        attended.save().then(() => {
          this.currentPeople.fetch({select: 'conferences'}).then(() => {
            this.getAvailableConferences(this.currentPeople);
          });
        });
      });
    }
  }
}