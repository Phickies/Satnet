import { Text } from 'troika-three-text';

export default class WorldTime {

  constructor(initHours = 0, initMinutes = 0, initSeconds = 0, initMonth = 1, initDay = 1, initYear = 2024, timeScale = 1) {
    this.seconds = initSeconds;
    this.minutes = initMinutes;
    this.hours = initHours;
    this.month = initMonth;
    this.day = initDay;
    this.year = initYear;
    this.timeScale = timeScale;

    this.timeDisplay = new Text();
    this.timeDisplay.fontSize = 0.5;
    this.timeDisplay.position.set(0, 2, 0);

    this.velocity = 0;
    this.acceleration = 0;
  }


  run(deltaTime) { // deltaTime is the time since the last frame in seconds
    this.seconds += deltaTime;

    while (this.seconds >= 60) {
      this.seconds -= 60;
      this.minutes++;
    }
    while (this.minutes >= 60) {
      this.minutes -= 60;
      this.hours++;
    }
    while (this.hours >= 24) {
      this.hours -= 24;
      this.day++;
    }

    while (this.day > this.daysInMonth(this.month, this.year)) {
      this.day -= this.daysInMonth(this.month, this.year);
      this.month++;

      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
    }
  }


  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }


  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }


  getFormattedTime(includeDate = false) {
    const formattedTime = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}:${Math.floor(this.seconds).toString().padStart(2, '0')}`;

    if (includeDate) {
      return `${this.month}/${this.day}/${this.year} ${formattedTime}`;
    } else {
      return formattedTime;
    }
  }


  setSpecificTime(newHours = 0, newMinutes = 0, newSeconds = 0, newMonth = 1, newDay = 1, newYear = 2024) {
    this.hours = newHours;
    this.minutes = newMinutes;
    this.seconds = newSeconds;
    this.month = newMonth;
    this.day = newDay;
    this.year = newYear;
  }


  setCurrentTime() {
    const now = new Date();
    this.hours = now.getHours();
    this.minutes = now.getMinutes();
    this.seconds = now.getSeconds();
    this.month = now.getMonth() + 1; // JavaScript months are 0-based
    this.day = now.getDate();
    this.year = now.getFullYear();
  }


  setTimeScale(value) {
    this.timeScale = value;
  }

  
  update(deltaTime) {
    this.velocity += this.acceleration;
    this.acceleration = deltaTime.getDelta() * this.timeScale;
    this.run(this.acceleration);
  }


  display() {
    const timeElement = document.getElementById("time-text");
    timeElement.textContent = this.getFormattedTime(true);
  }

}