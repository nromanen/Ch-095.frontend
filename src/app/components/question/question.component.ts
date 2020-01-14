import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Question} from "../../models/question";
import {SaveSurveyService} from "../../services/save-survey.service";

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  @Input() public question: Question;
  isButtonDisable: boolean = true;
  isTypeSet: boolean = false;
  previewUrls: any[] = [];
  pictureValidation: string;
  static readonly MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

  @Output() deleteQuestion = new EventEmitter<number>();

  deleteQuestionFromConstructor(index:number) {
    this.deleteQuestion.next(index);
  }

  constructor(private saveSurveyService: SaveSurveyService) {
    this.previewUrls.push(null);
  }

  ngOnInit() {
    if(this.question.uploadingFiles){
      for(let i = 0; i < this.question.uploadingFiles.length; i++){
        this.preview(i);
      }
    }
  }

  setType(event: any) {
    this.question.type = event.target.value;
    this.isTypeSet = true;
    this.question.choiceAnswers.push('');
  }

  deleteVariant(variantOfAnswerIndex: number) {
    this.question.choiceAnswers.splice(variantOfAnswerIndex, 1);
    if (this.question.choiceAnswers.length === 0) this.question.type = 'not set';
  }
  addAnswerVariant() {
    this.question.choiceAnswers.push(" ");
    this.isButtonDisable = true;
  }

  setAnswerVariant(index, variantOfAnswer) {
    this.question.choiceAnswers[index] = variantOfAnswer;
    this.isButtonDisable = false;
  }

  //////////UPLOADING Picture///////////////

  uploadPicture(event, index) {
    if (this.isValidPicture(event.target.files[0])) {
      this.question.uploadingFiles[index] = event.target.files[0];
      this.question.choiceAnswers[index] = event.target.files[0].name;
      this.isButtonDisable = false;
      this.preview(index);
    }
  }

  private isValidPicture(file: any) {
    this.pictureValidation = '';
    let isValid: boolean = true;
    if (!this.isPicture(file.type)) {
      isValid = false;
      this.pictureValidation += "You have not uploaded a type photo.";
    }
    if (!this.isPictureSmallerThanMaxValue(file.size)) {
      isValid = false;
      this.pictureValidation += "Picture did not load because its size is larger than " + (QuestionComponent.MAX_UPLOAD_SIZE / (1024 * 1024) + "MB");
    }
    return isValid;
  }

  private isPictureSmallerThanMaxValue(size: number) {
    return size < QuestionComponent.MAX_UPLOAD_SIZE;
  }

  private isPicture(fileType: string) {
    return fileType.substr(0, 5) === "image";
  }


  preview(index) {
    let reader = new FileReader();
    reader.readAsDataURL(this.question.uploadingFiles[index]);
    reader.onload = (_event) => {
      this.previewUrls[index] = reader.result;
    }
  }

  deletePicture(index: number) {
    this.pictureValidation = '';
    this.question.choiceAnswers.splice(index, 1);
    if (this.question.uploadingFiles) {
      this.question.uploadingFiles.splice(index, 1);
      this.previewUrls.splice(index, 1);
    }
    if (this.question.choiceAnswers.length === 0) this.question.type = 'not set';
  }

}
