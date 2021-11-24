// @ts-nocheck
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Injectable
} from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from '../websocket.service';
import * as $ from 'jquery';
import { Router } from '@angular/router'
import { HttpClient } from "@angular/common/http";
import * as Rx from 'rxjs/Rx'
import { RTCSession } from 'jssip/lib/RTCSession';
import { WebSocketInterface, UA } from 'jssip';
import Swal from 'sweetalert2';
import { ExtensService } from '../extens.service';


let ParametrosConfiguracion = require('../../../src/appSettings.json');
let htmlTabs = "";
//Sección de HTML para cada pestaña


// const subject = webSocket(ParametrosConfiguracion.UrlServices.WebSocket);
const Url_Services = ParametrosConfiguracion.UrlServices.ServiceUrl;
const Url_Socket = ParametrosConfiguracion.UrlServices.WebSocket;
// const subject = webSocket(Url_Socket + '/paneloperator/poextens');
let session: RTCSession;
const socket = new WebSocketInterface(ParametrosConfiguracion.UrlServices.Socket);
const configuration = {
  sockets: [socket],
  uri: ParametrosConfiguracion.UrlServices.SipUri,
  password: ParametrosConfiguracion.UrlServices.Contrasena,
  ws_servers: ParametrosConfiguracion.UrlServices.Socket,
  realm: ParametrosConfiguracion.UrlServices.Realm,
  contact_uri: ParametrosConfiguracion.UrlServices.SipUri
};
const ua = new UA(configuration);
ua.start();

$('#hangup').on('click', (e) => {
  e.preventDefault();
  ua.stop();
  ua.unregister({ all: true });
});

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})

@Injectable()
export class PrincipalComponent implements OnInit {
  public message: Subject<Message>;

  public Pestanas: any[] = [];
  public Cards: any[] = [];

  public Roles: any;
  public PestanasInicial: any[] = [];
  public datosServicio: any[] = [];
  constructor(private router: Router, private http: HttpClient, private extenseService: ExtensService) {
    this.PestanasInicial = this.router.getCurrentNavigation().extras.state.Pestanas;
    this.router.getCurrentNavigation().extras.state.Pestanas[0].forEach((element, i) => {
      this.Pestanas.push(element);
    });
    debugger;
    this.Roles = this.router.getCurrentNavigation().extras.state.datos["rol"];


    // extenseService.message.subscribe(msg => {
    //   msg.forEach(element => {
    //     this.Cards.push({
    //       ext: 1001,
    //       status: "Idle"
    //     })
    //   });

    // })
  }

  drop() {
    document.getElementById("myDropdown").classList.toggle("show");

  }

  AbrirTelefono() {
    var x: any = document.getElementById("myDIV");
    console.log(x.classList.contains('open'));
    if (x.classList.contains('open')) {
      x.classList.remove("open");
    } else {
      x.classList.add("open");
      $("#test").focus();
    }
  }

  AbrirCartaPresentacion(Event: any) {

  }

  ObtenerNumerosABloquear() {
    let cedula = $('#cedulaUsuario').val();
    if (cedula != "") {
      //Consultar numeros de telefono por cedula
      Swal.showLoading();
    } else {
      Swal.fire({
        title: '',
        text: 'Debe ingresar una cédula válida',
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon: 'error'
      })
    }
  }

  PanelOperator(Event: any) {
    Event.preventDefault();
  }

  RenderGestiones(Opcion: string, Event: any) {
    Event.preventDefault();
    switch (Opcion) {
      case "PanelOperator":
        $('#contenedorGestiones').html('<input type="button" id="btnPanelOperator" value="PanelOperator"/>');
        break;
      case "Telefonos Bloqueados":
        $('#contenedorGestiones').html(`
          <div class="flexContainer">
            <input id="cedulaUsuario" class="inputField" />
            <input id="consultarNumerosBloquear" value="Consultar" title="Consultar" type="button"/>
          </div>
        `);
        $('#consultarNumerosBloquear').on('click', () => {
          //Consultar Números de teléfono para bloquear
          this.ObtenerNumerosABloquear();
        });
        break;
      case "Mocca":
        $('#contenedorGestiones').html('<textarea name="" id="" cols="30" rows="10">Mocca</textarea>');
        break;
      default:
        break;
    }
  }

  Llamar() {
    let numero = $('#output').find("span").text();
    if (numero !== "") {
      var eventHandlers = {
        'progress': function () {
          console.log('Llamada en proceso');
        },
        'failed': function (e: any) {
          console.log('La llamada falló debido a: ' + e.data.cause);
        },
        'ended': function (e: any) {
          console.log('La llamada finalizó por: ' + e.data.cause);
        },
        'confirmed': function () {
          console.log('Llamada confirmada');
        }
      };


      var options = {
        'eventHandlers': eventHandlers,
        'mediaConstraints': { 'audio': true, 'video': false }
      };

      session = ua.call(`sip:${numero}${ParametrosConfiguracion.UrlServices.DominioPlanta}`, options);
    }


  }

  TransferirLlamada() {
    Swal.fire({
      title: ParametrosConfiguracion.Mensajes.ExtensionTransfer,
      input: "text",
      confirmButtonText: "Transferir",
      allowOutsideClick: false,
      preConfirm: (result) => {
        if (result) {
          ua.stop();
          ua.unregister();
          ua.start();
          ua.call(`sip:${result}${ParametrosConfiguracion.UrlServices.DominioPlanta}`, {
            'mediaConstraints': {
              audio: true,
              video: false
            }
          })
        } else {
          Swal.showValidationMessage(ParametrosConfiguracion.Mensajes.ExtensionInvalida);
        }
      }
    });
  }

  ngOnInit(): void {
    $("#login-form").hide();
    // this.PestanasInicial[0].forEach((element, i) => {
    //   htmlTabs += `<li class="${element}"><a src="${i}" href="javascript:void(0);" class="${i === 0 ? 'active tabCall' : 'tabCall'}">${element}</a></li>`;
    // });

    //$('.tabContainer').append("<ul class='tabs'>" + htmlTabs + "</ul>");

    let htmlCoord = '<ul class="tabs"><li><a src="0" href="javascript:void(0);" class="active">Predictivo</a></li><li><a src="0" href="javascript:void(0);" class="active">Predictivo</a></li>' +
      '<li><a src="0" href="javascript:void(0);" class="active">Búsqueda</a></li>' +
      '<li><a src="0" href="javascript:void(0);" class="active">Coordinación</a></li></ul>' +
      '<div class="tabContent">' +
      '<div id="1">' +
      '<fieldset>' +
      '<ul>' +
      '<li><a id="PanelOperator" (click)="PanelOperator($event)" href="#">PanelOperator</a></li>' +
      '<li><a id="telefonosBloqueados" (click)="RenderGestiones("Telefonos Bloqueados", $event)" href="#">Teléfonos bloqueados</a></li>' +
      '<li><a id="mocca" (click)="RenderGestiones("Mocca", $event)" href="#">Mocca</a></li>' +
      '</ul>' +
      '</fieldset>' +
      '<fieldset>' +
      '<ul id="contenedorGestiones" class="container">' +

      '</ul>' +
      '</fieldset>' +
      '</div>' +
      '</div>';

    let htmlUser = '<ul class="tabs"><li><a src="0" href="javascript:void(0);" class="active">Predictivo</a></li><li><a src="0" href="javascript:void(0);" class="active">Predictivo</a></li>' +
      '<li><a src="0" href="javascript:void(0);" class="active">Búsqueda</a></li>' +
      '<li><a src="0" href="javascript:void(0);" class="active">IBR Transaccional</a></li></ul>';

    let htmlSuper = '<ul class="tabs">' +
      '<li><a src="tab0" href="javascript:void(0);" class="active">Predictivo</a></li>' +
      '<li><a src="tab1" href="javascript:void(0);" class="">Búsqueda</a></li>' +
      '<li><a src="tab2" href="javascript:void(0);" class="">Coordinación</a></li>' +
      '<li><a src="tab3" href="javascript:void(0);" class="">IBR Trannsaccional</a></li>' +
      '<li><a src="tab4" href="javascript:void(0);" class="">Informes</a></li>' +
      '<li><a src="tab5" href="javascript:void(0);" class="">Cargue y descargue de repartos</a></li></ul>' +
      '<div class="tabContent"><div class="tabCall" id="tab0">' +
      '<fieldset>' +
      '<legend>Datos financieros</legend>' +
      '<ul>' +
      '<li><a id="PanelOperator" (click)="PanelOperator($event)" href="#">PanelOperator</a></li>' +
      '<li><a id="telefonosBloqueados" (click)="RenderGestiones("Telefonos Bloqueados", $event)" href="#">Teléfonos bloqueados</a></li>' +
      '<li><a id="mocca" (click)="RenderGestiones("Mocca", $event)" href="#">Mocca</a></li>' +
      '</ul> ' +
      '</fieldset>' +
      '<br/>' +
      '<fieldset>' +
      '<legend>Barra acciones</legend>' +
      '</fieldset>' +
      '<br/>' +
      '</div>' +
      '<div class="tabCall" id="tab1">' +
      '<fieldset>' +
      '<legend>Datos financieros</legend>' +
      '<ul>' +
      '<li><a id="PanelOperator" (click)="PanelOperator($event)" href="#">PanelOperator</a></li>' +
      '<li><a id="telefonosBloqueados" (click)="RenderGestiones("Telefonos Bloqueados", $event)" href="#">Teléfonos bloqueados</a></li>' +
      '<li><a id="mocca" (click)="RenderGestiones("Mocca", $event)" href="#">Mocca</a></li>' +
      '</ul> ' +
      '</fieldset>' +
      '<br/>' +
      '<fieldset>' +
      '<legend>Barra acciones</legend>' +
      '</fieldset>' +
      '<br/>' +
      '</div>' +
      '<div class="tabCall" id="tab2">' +
      '<fieldset>' +
      '<legend>Predictivo</legend>' +
      '<ul>' +
      '<li><a id="PanelOperator" href="#">Crear predictivos</a></li>' +
      '<li><a id="mocca" href="#">Obtener predictivos</a></li>' +
      '<li><a id="telefonosBloqueados" (click)="RenderGestiones("Telefonos Bloqueados", $event)" href="#">Iniciar/Pausar predictivos</a></li>' +
      '<li><a id="mocca" href="#">Crear colas de marcación predictivos</a></li>' +
      '<li><a id="mocca" href="#">Crear, actualizar y eliminar IBRs</a></li>' +
      '<li><a id="mocca" href="#">Panel operator</a></li>' +
      '</ul> ' +
      '</fieldset>' +
      '</div>' +
      '<div class="tabCall" id="tab3">' +
      '<fieldset>' +
      '<legend>Datos financieros</legend>' +
      '<ul>' +
      '<li><a id="PanelOperator" (click)="PanelOperator($event)" href="#">PanelOperator</a></li>' +
      '<li><a id="telefonosBloqueados" (click)="RenderGestiones("Telefonos Bloqueados", $event)" href="#">Teléfonos bloqueados</a></li>' +
      '<li><a id="mocca" (click)="RenderGestiones("Mocca", $event)" href="#">Mocca</a></li>' +
      '</ul> ' +
      '</fieldset>' +
      '<br/>' +
      '<fieldset>' +
      '<legend>Barra acciones</legend>' +
      '</fieldset>' +
      '<br/>' +
      '</div>' +
      '<div class="tabCall" id="tab1">' +
      '<fieldset>' +
      '</div>' +
      '<div class="tabCall" id="tab4">' +
      '<p>informes</p>' +
      '</div>' +
      '<div class="tabCall" id="tab5">' +
      
      '</div></div>' 
      

    let htmlAdmin = '<ul class="tabs"><li><a src="0" href="javascript:void(0);" class="active">Informes</a></li><li><a src="0" href="javascript:void(0);" class="active">Predictivo</a></li></ul>';

    let htmlOper = '<ul class="tabs"><li><a src="0" href="javascript:void(0);" class="active">Cargue y descargue de repartos</a></li><li><a src="0" href="javascript:void(0);" class="active">Predictivo</a></li></ul>';

    $('.tabContainer').html("");

    debugger;
    switch (this.Roles) {
      case "Super":
        $('.tabContainer').append(htmlSuper);
        $('.tabCall:not(:first)').hide();
        break;
      case "Coord":
        $('.tabContainer').append(htmlCoord);
        $('.tabCall:not(:first)').hide();
        break;
      case "User":
        $('.tabContainer').append(htmlUser);
        $('.tabCall:not(:first)').hide();
        break;
      case "Oper":
        $('.tabContainer').append(htmlOper);
        $('.tabCall:not(:first)').hide();
        break;
      case "Admin":
        $('.tabContainer').append(htmlAdmin);
        $('.tabCall:not(:first)').hide();
        break;
    }

    $("#content").on("click", ".tabContainer .tabs a", function (e) {
      e.preventDefault(),
        $(this)
          .parents(".tabContainer")
          .find(".tabContent > div")
          .each(function () {
            $(this).hide();
          });

      $(this)
        .parents(".tabs")
        .find("a")
        .removeClass("active"),
        $(this).toggleClass("active"), $("#" + $(this).attr("src")).show();
    });

    $('.tabContainer > .tabs').css({
      "overflow": "hidden",
      "width": "100%",
      "margin": 0,
      "padding": 0,
      "list-style": "none",
      "display": "flex"
    });
    $('.tabs > li').css({
      "float": "left",
      "display": "flex",
      "flex": 1
    })
    $('.tabs a').css({
      "position": "relative",
      "background": "#e4dee7",
      "border - top": "3px solid rgba(0, 0, 0, 0)",
      "padding": "1em 0.5em",
      "float": "left",
      "text - decoration": "none",
      "color": "#000",
      "margin": "0 0.1em 0 0",
      "font - size": "1em",
      "flex": "1",
      "transition": "all 0.35s ease"
    })
    $('.tabs a.active').css({
      "border - top": "3px solid #f39d77",
      "color": "black",
      "background": "inherit",
    })
    $('.tabs a').hover(function () {
      $(this).css('background', 'inherit');
    });

    let predictivo = '<div class="tabContent predictivo">' +
      '<div id="0">' +
      '<fieldset>' +
      '<ul>' +
      '<li><a id="PanelOperator" (click)="PanelOperator($event)" href="#">PanelOperator</a></li>' +
      '<li><a id="telefonosBloqueados" (click)="RenderGestiones("Telefonos Bloqueados", $event)" href="#">Teléfonos bloqueados</a></li>' +
      '<li><a id="mocca" (click)="RenderGestiones("Mocca", $event)" href="#">Mocca</a></li>' +
      '</ul>' +
      '</fieldset>' +
      '<fieldset>' +
      '<ul id="contenedorGestiones" class="container">' +
      '<div *ngFor="let cards of Cards; let i = index" class="card">' +
      '<img src="" alt="">' +
      '<p style="width:100%">{{cards.ext}}</p>' +
      '<div class="">' +
      '<h4><b>{{cards.status}}</b></h4>' +
      '<p>{{cards.status}}</p>' +

      '</div>' +
      '</div>' +
      '</ul>' +
      '</fieldset>' +
      '</div>' +
      '</div>';

    let busqueda = '<div class="tabContent busqueda">' +
      '<div id="1">' +
      '<p>prueba busqueda</p>'
    '</div>' +
      '</div>';

    let coordinacion = '<div class="tabContent coordinacion">' +
      '<div id="2">' +
      '<p>prueba busqueda</p>'
    '</div>' +
      '</div>';

    let ibr = '<div class="tabContent ibr">' +
      '<div id="3">' +
      '<p>prueba busqueda</p>'
    '</div>' +
      '</div>';

    let informes = '<div class="tabContent informes">' +
      '<div id="4">' +
      '<p>prueba busqueda</p>'
    '</div>' +
      '</div>';

    let cargueDescargue = '<div class="tabContent carguedescargue">' +
      '<div id="5">' +
      '<p>prueba busqueda</p>'
    '</div>' +
      '</div>';





    //Teléfono
    var count = 0;

    $(".digit").on('click', function () {
      var num = ($(this).clone().children().remove().end().text());
      if (count < 11) {
        $("#output").append('<span>' + num.trim() + '</span>');
        count++
      }
    });

    $('.fa-long-arrow-left').on('click', function () {
      $('#output span:last-child').remove();
      count--;
    });

    ///
    ua.on('newRTCSession', function (e: any) {
      if (e.originator === "remote") {
        var session_incoming = e.session;
        var options = {
          'mediaConstraints': {
            'audio': true,
            'video': false
          }
        };
        //si viene predictivo se hace la auto respuesta, sino le mando el metodo al botón para contestar
        session_incoming.answer(options);
      }
    });

    $('#transfer').on('click', (e) => {
      console.log(session);
      e.preventDefault();
      this.TransferirLlamada();
    });
    // Close the dropdown if the user clicks outside of it
    window.onclick = function (event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
  }

}
