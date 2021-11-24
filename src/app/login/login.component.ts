import { Component, OnInit } from '@angular/core';
import {
  Inviter,
  Registerer,
  UserAgent,
  UserAgentOptions,
  SessionState,
  Session
} from "sip.js";
import { Web } from "sip.js";

// Create media stream factory
const myMediaStreamFactory: Web.MediaStreamFactory = (
  constraints: MediaStreamConstraints,
  sessionDescriptionHandler: Web.SessionDescriptionHandler
): Promise<MediaStream> => {
  const mediaStream = new MediaStream(); // my custom media stream acquisition
  return Promise.resolve(mediaStream);
};


// Create session description handler factory
const mySessionDescriptionHandlerFactory: Web.SessionDescriptionHandlerFactory = Web.defaultSessionDescriptionHandlerFactory(
  myMediaStreamFactory
);

function handleAddTrack(sessionDescriptionHandler: Web.SessionDescriptionHandler): void {
  sessionDescriptionHandler.remoteMediaStream.onaddtrack = (event) => {
    const track = event.track;
    console.log("A track was added");
  };
  sessionDescriptionHandler.remoteMediaStream.onremovetrack = (event) => {
    const track = event.track;
    console.log("A track was removed");
  };
}

const transportOptions = {
  server: "ws:/callcont.douglashenao.com:8088/ws"
};

const numero = "1002";

const uri = UserAgent.makeURI("sip:1004@callcont.douglashenao.com");

const userAgentOptions: UserAgentOptions = {
  authorizationPassword: 'CallCont2021*',
  authorizationUsername: '1004',
  transportOptions,
  uri
};

const userAgent = new UserAgent(userAgentOptions);
const registerer = new Registerer(userAgent);


userAgent.start().then(() => {
  registerer.register();
});
// Helper function to get an HTML audio element
function getAudioElement(id: string): HTMLAudioElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLAudioElement)) {
    throw new Error(`Element "${id}" not found or not an audio element.`);
  }
  return el;
}

// Helper function to wait
async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function hangUp(): Promise<void> {
  // Construct a SimpleUser instance

}
// Main function
async function main(): Promise<void> {
  // SIP over WebSocket Server URL
  // The URL of a SIP over WebSocket server which will complete the call.
  // FreeSwitch is an example of a server which supports SIP over WebSocket.
  // SIP over WebSocket is an internet standard the details of which are
  // outside the scope of this documentation, but there are many resources
  // available. See: https://tools.ietf.org/html/rfc7118 for the specification.
  const server = "ws:/callcont.douglashenao.com:8088/ws";

  // SIP Request URI
  // The SIP Request URI of the destination. It's "Who you wanna call?"
  // SIP is an internet standard the details of which are outside the
  // scope of this documentation, but there are many resources available.
  // See: https://tools.ietf.org/html/rfc3261 for the specification.
  const destination = "sip:*310@callcont.douglashenao.com";

  // SIP Address of Record (AOR)
  // This is the user's SIP address. It's "Where people can reach you."
  // SIP is an internet standard the details of which are outside the
  // scope of this documentation, but there are many resources available.
  // See: https://tools.ietf.org/html/rfc3261 for the specification.
  const aor = "sip:1005@callcont.douglashenao.com";


  // Configuration Options
  // These are configuration options for the `SimpleUser` instance.
  // Here we are setting the HTML audio element we want to use to
  // play the audio received from the remote end of the call.
  // An audio element is needed to play the audio received from the
  // remote end of the call. Once the call is established, a `MediaStream`
  // is attached to the provided audio element's `src` attribute.
  const options: Web.SimpleUserOptions = {
    aor,
    media: {
      remote: {
        audio: getAudioElement("remoteAudio")
      }
    },
    userAgentOptions: {
      authorizationPassword: 'CallCont2021*',
      authorizationUsername: '1005'
    }
  };

  
  // Construct a SimpleUser instance
  const simpleUser = new Web.SimpleUser(server, options);
  $('#hangUp').on('click', () => {
    //Colgar llamada
    simpleUser.hangup();
  });
  // Hangup call
  // if (Colgar === 1) {
  //   simpleUser.hangup();
  // } else {
  // Supply delegate to handle inbound calls (optional)
  simpleUser.delegate = {
    onCallReceived: async () => {
      await simpleUser.answer();
    },
    onCallHangup: async () => {
      await simpleUser.hangup();
    }
  };

  // Connect to server
  await simpleUser.connect();

  // Register to receive inbound calls (optional)
  await simpleUser.register();

  // Place call to the destination
  await simpleUser.call(destination);

  // Wait some number of milliseconds
  await wait(1000);


  // <HTMLElement>endButton.addEventListener("click", function () {
  //   simple.hangup();

  // }, false);
  // var counter = 0;
  // var i = setInterval(async function () {
  //   // do your thing
  //   if (document.getElementById("hangUp")[0].clicked == true) {
  //     clearInterval(i);
  //     await simpleUser.hangup();
  //   }
  // }, 100);

  // await simpleUser.hangup();
  //}
}


// A Session state change handler which assigns media streams to HTML media elements.
function handleStateChanges(
  session: Session,
  localHTMLMediaElement: HTMLVideoElement | undefined,
  remoteHTMLMediaElement: HTMLAudioElement | HTMLVideoElement | undefined
): void {
  // Track session state changes and set media tracks to HTML elements when they become available.
  session.stateChange.addListener((state: SessionState) => {
    switch (state) {
      case SessionState.Initial:
        break;
      case SessionState.Establishing:
        break;
      case SessionState.Established:
        const sessionDescriptionHandler = session.sessionDescriptionHandler;
        if (!sessionDescriptionHandler || !(sessionDescriptionHandler instanceof Web.SessionDescriptionHandler)) {
          throw new Error("Invalid session description handler.");
        }
        if (localHTMLMediaElement) {
          assignStream(sessionDescriptionHandler.localMediaStream, localHTMLMediaElement);
        }
        if (remoteHTMLMediaElement) {
          assignStream(sessionDescriptionHandler.remoteMediaStream, remoteHTMLMediaElement);
        }
        break;
      case SessionState.Terminating:
        break;
      case SessionState.Terminated:
        break;
      default:
        throw new Error("Unknown session state.");
    }
  });
}

// Assign a MediaStream to an HTMLMediaElement and update if tracks change.
function assignStream(stream: MediaStream, element: HTMLMediaElement): void {
  // Set element source.
  element.autoplay = true; // Safari does not allow calling .play() from a non user action
  element.srcObject = stream;

  // Load and start playback of media.
  element.play().catch((error: Error) => {
    console.error("Failed to play media");
    console.error(error);
  });

  // If a track is added, load and restart playback of media.
  stream.onaddtrack = (): void => {
    element.load(); // Safari does not work otheriwse
    element.play().catch((error: Error) => {
      console.error("Failed to play remote media on add track");
      console.error(error);
    });
  };

  // If a track is removed, load and restart playback of media.
  stream.onremovetrack = (): void => {
    element.load(); // Safari does not work otheriwse
    element.play().catch((error: Error) => {
      console.error("Failed to play remote media on remove track");
      console.error(error);
    });
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

  title = 'CallCont';
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'a', 'b', 'c'];
  displayedColumns2: string[] = ['position'];
  dataSource = ELEMENT_DATA;
  dataSource2 = ELEMENT_DATA2;
  isShow = false;

  constructor() {

  }

  ngOnInit() {
    let count = 0;

    $(".digit").on('click', function () {
      let num = ($(this).clone().children().remove().end().text());
      if (count < 11) {
        $("#output").append('<span class="numeros">' + num.trim() + '</span>');
        count++
      }
    });

    $('.fa-long-arrow-left').on('click', function () {
      $('#output span:last-child').remove();
      count--;
    });
  }
  openForm() {
    $("#myForm").show(1000);
  }
  closeForm() {
    $("#myForm").hide(1000);
  }
  call() {
    main().then((res) => {
      console.log(res);

    }).catch((err) => {
      console.log(err);
    })

  }


  llamar() {
    const target: any = UserAgent.makeURI("sip:" + numero + "@callcont.douglashenao.com");
    // Create a user agent client to establish a session
    userAgent.start().then(() => {
      debugger;
      const inviter = new Inviter(userAgent, target)
      inviter.invite();

    });
  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  a: string;
  b: string;
  c: string;
}

export interface PeriodicElement2 {
  position: number;
}
const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', a: '', b: '', c: '' },
];

const ELEMENT_DATA2: PeriodicElement2[] = [
  { position: 1 },
];
