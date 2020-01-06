import {Component, OnInit} from '@angular/core';
import {Survey} from '../../models/survey';
import {SurveyService} from '../../services/survey.service';
import {Pageable} from '../../models/pageable';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FormControl} from "@angular/forms";
import {RedirectUtil} from "../../util/redirect-util";
import {HttpParams} from "@angular/common/http";

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.css']
})
export class SurveysComponent implements OnInit {

  surveys: Survey[];
  tempSurvey: number;
  isClearContacts: boolean;
  pageable: Pageable;
  title = new FormControl('');
  private redirects: RedirectUtil;

  constructor(private service: SurveyService, private router: Router, private route: ActivatedRoute) {
    this.tempSurvey = 0;
    this.redirects = new RedirectUtil(router, route);
  }

  ngOnInit() {
    this.getSurveys()
  }

  getSurveys() {
    this.service.getSurveys(this.buildRequestParams())
      .toPromise()
      .then(e => {
        this.surveys = e.items
        this.pageable = e.pageable
        if (this.surveys.length === 0){ this.previousPage() }
      })
      .catch(e => {
        console.error(e)
      });
  }

  surveyUpdateTitle() {
    this.service.surveyUpdateTitle(this.tempSurvey, this.title.value)
      .toPromise()
      .then(() => this.surveys[this.surveys.findIndex(s => s.id === this.tempSurvey)].title = this.title.value)
      .catch(e => console.error(e));
  }

  surveyStatusDone(id: number) {
    this.service.surveyStatusDone(id)
      .toPromise()
      .then(e => this.surveys[this.surveys.findIndex(s => s.id === id)].status = 'DONE')
      .catch(e => console.error(e));
  }

  clone() {
    this.service.cloneSurvey(this.tempSurvey, this.isClearContacts)
      .toPromise()
      .then(e => {
        e.countContacts = 0;
        e.countAnswers = 0;
        this.surveys.push(e);
        if (this.surveys.length > this.pageable.size){ ++this.pageable.lastPage }
        console.log(e)
      })
      .catch(e => console.error(e));
  }

  deleteSurvey() {
    this.service.deleteSurvey(this.tempSurvey)
      .toPromise()
      .then(e => {
        if (e === 'OK') {
          this.surveys.splice(this.surveys.findIndex(i => i.id === this.tempSurvey), 1)
          if (this.surveys.length === 0){ this.previousPage() }
        }
      })
      .catch(e => console.error(e));
  }



  changeTempSurvey(survey: Survey): void {
    this.tempSurvey = survey.id;
    this.title.setValue(survey.title);
  }

  private buildPages(): number[] {
    let pages = [];
    for (let i = 1; i <= this.pageable.lastPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  previousPage(): void {
    if (this.pageable.currentPage > 1) {
      this.refreshPageWithParam('page', --this.pageable.currentPage);
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.pageable.lastPage) {
      this.refreshPageWithParam('page', page);
    }
  }

  nextPage(): void {
    if (this.pageable.currentPage < this.pageable.lastPage) {
      this.refreshPageWithParam('page', ++this.pageable.currentPage);
    }
  }

  refreshPageWithParam(key: string, value: any): void {
    this.redirects.setParam(key, value,['surveys']);
  }

  private buildRequestParams(): HttpParams {
    let params = new HttpParams();
    let currentPage = Number(this.route.snapshot.queryParamMap.get('page'));
    let size = +this.route.snapshot.queryParamMap.get('size');
    let direction = this.route.snapshot.queryParamMap.get('direction');
    let sort = this.route.snapshot.queryParamMap.get('sort');
    let status = this.route.snapshot.queryParamMap.get('status');
    if (currentPage !== null && currentPage > 0) {
      params = params.append('page', String(currentPage - 1));
    }
    if (size > 0) {
      params = params.append('size', String(size));
    }
    if (direction !== null) {
      params = params.append('direction', direction);
    }
    if (sort !== null) {
      params = params.append('sort', sort);
    }
    if (status !== null) {
      params = params.append('status', status);
    }
    return params;
  }

}
