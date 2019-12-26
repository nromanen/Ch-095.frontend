import { Component, OnInit, ViewChild } from '@angular/core';
import {Question} from "../../models/question";
import {SaveSurvey} from "../../models/SaveSurvey";
 import {SaveSurveyService} from "../../services/save-survey.service";

@Component({
  selector: 'app-form-constructor',
  templateUrl: './form-constructor.component.html',
  styleUrls: ['./form-constructor.component.css']
})
export class FormConstructorComponent implements OnInit {
  surveyName:string;
  questionCounter:number;
  questions:Question[];

  constructor(private saveSurveyService : SaveSurveyService) {
    this.questionCounter = 0;
    this.questions = [];
  }

  ngOnInit() {
  }

  addNewQuestion(){
    this.questionCounter = this.questionCounter + 1;
    let question = new Question();
    question.index = this.questionCounter;
    question.question = '';
    question.type = "not set";
    question.answers = [];
    question.required = false;
    console.log(question);
    this.questions.push(question);
  }

  sendSurvey(){
    let saveSurvey:SaveSurvey = new SaveSurvey();
    saveSurvey.title = this.surveyName.valueOf();
    console.log(saveSurvey.title);
    saveSurvey.userID = 0;
    saveSurvey.questions = this.questions;
    this.saveSurveyService.saveSurvey(saveSurvey).subscribe(e=> {console.log("done")});
  }


}
