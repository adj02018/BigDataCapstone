// 인라인 에디터 수정시 반드시 백업파일 생성해주세요.
'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion, Payload, Image} = require('dialogflow-fulfillment');

// 데이터베이스 연결 라인
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://hallymbot-uala.firebaseio.com/',
  //storageBucket: "gs://hallymbot-uala.appspot.com" // storage 경로
});
// end


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  
// function 호출 영역
  function smartlead_intent(agent) {
    agent.add(new Card({
        title: `한림SmartLEAD`,
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/hallymbot-uala.appspot.com/o/smartlead.png?alt=media&token=1f1805fb-bbd8-46fb-9999-f7f34a1f322b',
        text: `[뒤로가기 :: Q]`,
      	buttonText: '한림SmartLEAD 이동',
        buttonUrl: 'https://smartlead.hallym.ac.kr/'
      })
    );
  }
  function location_intent(agent){
    agent.add(new Card({
      title: `한림대학교 캠퍼스맵`,
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/hallymbot-uala.appspot.com/o/symbol-ui-mark.png?alt=media&token=f7db00d4-5737-4ddc-96e2-3d7ea5d3195a',
      text: `교내 찾으려고 하는 건물명을 입력해주세요. [뒤로가기 :: Q]`,
      buttonText: '캠퍼스맵 사이트 이동',
      buttonUrl: 'https://www.hallym.ac.kr/hallym_univ/sub04/cP6/sCP1'
      })
    );
  }
  
  function calendar_intent(agent){
    agent.add(new Card({
      title: `한림대학교 학사일정`,
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/hallymbot-uala.appspot.com/o/symbol-ui-mark.png?alt=media&token=f7db00d4-5737-4ddc-96e2-3d7ea5d3195a',
      text: `[뒤로가기 :: Q]`,
      buttonText: '학교 학사일정 이동',
      buttonUrl: 'https://www.hallym.ac.kr/hallym_univ/sub02/cP1/sCP1.html'
      })
    );
  }
  
  function constr_intent(agent) {
      // 건물위치 안내
      return admin
        .database()
        .ref("building/" + agent.parameters.construct)
        .once("value")
        .then((snapshot) => {
          const value = snapshot.child("infom").val();

          agent.add(new Image("https://firebasestorage.googleapis.com/v0/b/hallymbot-uala.appspot.com/o/campus%20Map.png?alt=media&token=e2745b3e-2512-4100-b700-64940a11e53c"));
          agent.add(`${agent.parameters.construct} 위치는 ${value}`);
          
        });
    }
  
  
  function date_intent(agent){ // 학사일정 안내
    return admin.database().ref('date/'+agent.parameters.date).once('value').then((snapshot) => {
      const value = snapshot.child('start').val();
      const value2 = snapshot.child('end').val();
      
      if(value != null){
        if(value2 != null){
          agent.add(`${agent.parameters.date} 날짜는 \n${value} 부터 ${value2} 까지 입니다.`);
        }
        else{
          agent.add(`${agent.parameters.date} 날짜는 \n${value} 입니다.`);
        }
      }
      else
      {
        agent.add(`죄송합니다. \n해당 날짜가 등록되어있지 않습니다.`);
      }
    });
  }
  
  function professor_info(agent){// 교수님 정보안내
    return admin.database().ref('professor/'+agent.parameters.professor).once('value').then((snapshot) => {
      const value = snapshot.child('call').val();
      const value2 = snapshot.child('email').val();
      const value3 = snapshot.child('room').val();
        
      agent.add(`${agent.parameters.professor} 교수님의 대한 정보입니다.`);
      if(value != null)
        agent.add(`전화번호: ${value} `);
      if(value2 != null)
        agent.add(`이메일: ${value2} `);
      if(value3 != null)
        agent.add(`연구실: ${value3}호 `);
      agent.add(`[홈으로 가기 :: Q]`);
    });
  }
  

  
// intent, function 선언부
  let intentMap = new Map();
  intentMap.set('where building', constr_intent); // 건물위치 안내
  intentMap.set('date intent', date_intent); // 학사일정 안내
  intentMap.set('smartlead intent',smartlead_intent); // 스마트리드 홈페이지 안내
  intentMap.set('professor information - custom', professor_info); // 교수님 정보안내
  intentMap.set('professor information - custom-2', professor_info); // 교수님 정보안내
  intentMap.set('location intent', location_intent); // 캠퍼스맵 안내
  intentMap.set('location intent - custom', constr_intent); // 건물위치 안내
  intentMap.set('calendar intent', calendar_intent); // 학사일정 홈페이지 안내
  
  
  
  agent.handleRequest(intentMap);
  
//end
});
