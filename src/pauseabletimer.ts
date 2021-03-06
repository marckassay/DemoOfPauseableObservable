import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

export interface IIntervalEmission {
    readonly state: string;
    readonly count: number;
}

export class PauseableTimer 
{
    pauser: Subject<boolean>;
    source: Observable<IIntervalEmission>;
    publication: Observable<IIntervalEmission|any>;
    publicationSubscription: Subscription;
    paused: boolean = false;

    constructor() {
        this.initializeTimer();
        window.onload = (e)=>{
            this.getStart().addEventListener('click',()=>this.start());

            this.getPause().addEventListener('click',()=>this.pause());
            this.getPause().setAttribute('disabled', 'true');

            this.getReset().addEventListener('click',()=>this.reset());
            this.getReset().setAttribute('disabled', 'true');
        }
    }
    
    initializeTimer() {
        let timelinePointer: number = 40;

        this.pauser = new Subject<boolean>();
        
        const sequenceA = Observable.timer(0, 500)
        .map((val) => { return {state: "SequenceA", count: --timelinePointer} as IIntervalEmission } )
        .takeWhile((x: IIntervalEmission) => {return x.count > 20});
        
        const sequenceB = Observable.timer(0, 500)
        .map((val) => {return {state: "SequenceB", count: timelinePointer--} as IIntervalEmission } )
        .takeWhile((x: IIntervalEmission) => {return (x.count <= 20) && (x.count >= 0)});
        
        this.source = Observable.concat(sequenceA, sequenceB)
        
        this.pauser.next(true);
        
        this.publication = this.pauser.switchMap( (paused) => (paused == true) ? Observable.never() : this.source );

        this.subscribeTimer();
    }

    subscribeTimer(): void {
        this.publicationSubscription = this.publication.subscribe((e: any) => {
            this.getTextArea().innerHTML += e.state+": "+e.count+"<br>";
        }, (err: any) => {
            console.log(err);
        }, () => {
            this.getTextArea().innerHTML += "Timer completed!";
        });
    }

    start(): void {
        this.getStart().setAttribute('disabled', 'true');
        this.getPause().removeAttribute('disabled');
        this.getReset().removeAttribute('disabled');

        this.pauser.next(false);
        this.getTextArea().innerHTML = "Started"+"<br>";
    }
    pause(): void {
        this.paused = (this.paused) ? false:true;
        this.getPause().innerHTML = (this.paused)? 'UNPAUSE':'PAUSE';

        const mesg = (this.paused)? 'Now paused':'Now playing';
        
        this.getTextArea().innerHTML += mesg+"<br>";

        this.pauser.next(this.paused);
    }
    reset(): void {
        this.getPause().setAttribute('disabled', 'true');
        this.getReset().setAttribute('disabled', 'true');

        this.paused = false;
        this.getStart().removeAttribute('disabled');
        this.getPause().innerHTML = 'PAUSE';
        this.getTextArea().innerHTML = '';

        this.publicationSubscription.unsubscribe();
        this.initializeTimer();
    }

    private getStart() {
        return document.getElementById('start');
    }
    private getPause() {
        return document.getElementById('pause');
    }
    private getReset() {
        return document.getElementById('reset');
    }
    private getTextArea() {
        return document.getElementById('output');
    }
}
export default PauseableTimer;