// ==UserScript==
// @name         KifSave
// @namespace    https://github.com/thaim/kifsave-user-js
// @version      0.1.0
// @description  save kif file
// @author       thaim
// @match        https://shogiwars.heroz.jp/games/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  console.log('load user script: KifSave');

  if (window.location.pathname.startsWith('/games/')) {
    addSaveButton('Header__header____bzsO', generateKif);
  }

  function parseUser() {
    console.log('[KifSave]parsing user');
    var front = document.getElementsByClassName('UserInfo__front___3xJsM')[0];
    var back = document.getElementsByClassName('UserInfo__back___Vw6I6')[0];
    var frontUser = '';
    var backUser = '';

    for (var i=0; i<front.childNodes.length; i++) {
        if (front.childNodes[i].nodeName == 'A') {
            frontUser = front.childNodes[i].innerHTML;
        }
    }
    for (i=0; i<back.childNodes.length; i++) {
        if (back.childNodes[i].nodeName == 'A') {
            backUser = back.childNodes[i].innerHTML;
        }
    }

    var sente = '';
    var gote = '';
    if (frontUser.startsWith('▲')) {
        sente = frontUser.substring(1);
        gote = backUser.substring(1);
    } else {
        sente = backUser.substring(1);
        gote = frontUser.substring(1);
    }

    console.log('user parsed:' + sente + ' vs ' + gote);
    return [sente, gote];
  }

  function parseSashite() {
    var sashite = [];
    var opt = document.getElementsByClassName('Playback__kif___1evzo')[1];
    for (var i=1; i<opt.childNodes.length-1; i++) {
        var te = opt.childNodes[i].innerHTML.split(" ")[1];
        sashite.push(te.substring(1));
    }

    console.log('sashite parsed');
    return sashite
  }

  function generateKif() {
    var user = parseUser();
    var sashite = parseSashite();

    var header = kifHeader(user);
    var body = kifBody(sashite);

    var filename = window.location.pathname.split("/")[2]
    saveAs(header, body, filename + '.kif');
  }

  function kifHeader(user) {
    var data = "#KIF version=2.0 encoding=UTF-8\n"
             + "# KIF形式棋譜ファイル\n"
             + "# Generated by KifSave\n"
             + "手合割：平手\n"
             + "先手：" + user[0] + "\n"
             + "後手：" + user[1] + "\n"
             + "手数----指手---------消費時間--\n";

    return data
  }

  function kifBody(sashite) {
      var data = '';
      for (var i=0; i<sashite.length; i++) {
          var shogiPos = toShogiPos(sashite[i].substring(0, 2));

          // fix padding
          var padding = '    ';
          if (sashite[i].includes('打')) {
              padding = '      '
          } else if (sashite[i].includes('成')) {
              padding = '  '
          }

          data += ('   ' + (i+1)).slice(-4)
                + ' '
                + shogiPos + sashite[i].substring(2) + padding
                + '(00:00 / 00:00:00)\n';
      }

      return data
  }

  function toShogiPos(pos) {
      var kanji = "一二三四五六七八九"
      var shogiPos = String.fromCharCode(pos.charCodeAt(0) + 0xFEE0)
                   + kanji.charAt(parseInt(pos.charAt(1))-1);
      console.log(pos + ' -> ' + shogiPos);
      return shogiPos;
  }

  function addSaveButton(targetClassname, func) {
    var btnSave = document.createElement('button');
    btnSave.type = 'button'
    btnSave.className = 'Playback__kif___1evzo';
    btnSave.innerHTML = '棋譜を保存';
    btnSave.onclick = func;

    var header = document.getElementsByClassName(targetClassname)[0];
    header.appendChild(btnSave);
    console.log('add save button');
  }

  function saveAs(header, body, filename) {
    var blob = new Blob([header, body], {type: "text/plain;charset=utf-8"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    a.download = filename;
    a.click();
    console.log('kif saved');
  }
})();