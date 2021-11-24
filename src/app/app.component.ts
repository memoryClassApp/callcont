import { Component } from '@angular/core';
import * as $ from 'jquery';
import { Router } from '@angular/router'
import { WebSocketInterface, UA } from 'jssip';
import { RTCSession } from 'jssip/lib/RTCSession';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import jwt_decode from "jwt-decode";
var ParametrosConfiguracion = require('../../src/appSettings.json');
const Url_Services = ParametrosConfiguracion.UrlServices.ServiceUrl;
let Roles: any = ParametrosConfiguracion.Roles;
let Pestanas: any[] = [];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  public datosServicio: any[] = [];
  constructor(private router: Router, private http: HttpClient) {

  }

  LogIn(Pagina: string) {
    if ($('#User').val() === "" || $('#Pass').val() === "") {
      Swal.fire({
        text: ParametrosConfiguracion.Mensajes.LoginVacio,
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon: 'error'
      })
    } else {
      let url_Login = Url_Services + '/users/login';
      let ext = $('#User').val();
      let password = $('#Pass').val();
      let obj = {
        ext,
        password
      }
      this.http.post(url_Login, obj).subscribe((result: any) => {
        let datos: any = jwt_decode(result.token);
        let ContenidoHtml = {};

        switch (datos.rol) {
          case "Coord":
            Pestanas.push(Roles.Coord);
            ContenidoHtml =
              [`<div id="1">${ParametrosConfiguracion.HtmlRoles.Predictivo}</div><div id="2">${ParametrosConfiguracion.HtmlRoles.Busqueda}</div><div id="3">${ParametrosConfiguracion.HtmlRoles.Coordinacion}</div>`]
            break;
          case "User":
            Pestanas.push(Roles.User);
            ContenidoHtml =
              [`<div id="1">${ParametrosConfiguracion.HtmlRoles.Predictivo}</div><div id="2">${ParametrosConfiguracion.HtmlRoles.Busqueda}</div><div id="3">${ParametrosConfiguracion.HtmlRoles.IBR}</div>`]
            break;
          case "Super":
            Pestanas.push(Roles.Super);
            ContenidoHtml =
              [`<div id="1">${ParametrosConfiguracion.HtmlRoles.Predictivo}</div><div id="2">${ParametrosConfiguracion.HtmlRoles.Busqueda}</div><div id="3">${ParametrosConfiguracion.HtmlRoles.Coordinacion}</div><div id="4">${ParametrosConfiguracion.HtmlRoles.IBR}</div><div id="5">${ParametrosConfiguracion.HtmlRoles.Informes}</div><div id="6">${ParametrosConfiguracion.HtmlRoles.CargueDescargue}</div>`]
            break;
          case "Admin":
            Pestanas.push(Roles.Admin);
            ContenidoHtml =
              [`<div id="1">${ParametrosConfiguracion.HtmlRoles.Informes}</div>`]
            break;
          case "Oper":
            Pestanas.push(Roles.Oper);
            ContenidoHtml =
              [`<div id="1">${ParametrosConfiguracion.HtmlRoles.CargueDescargue}</div>`]
            break;
        }
        //Mostrar modal con opciones con click para seleccionar la entidad bancaria
        let htmlOpciones = "";
        let url_Entidades = Url_Services + '/core/entidad';
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', "Bearer " + result.token);
        this.http.get(url_Entidades, { headers }).subscribe((items: any) => {
          debugger;
          items.forEach((element: any) => {
            htmlOpciones += `<label class="container">${element}
                             <input type="radio" name="opciones">
                             <span class="checkmark"></span>
                             </label>`
          });
        }).add(() => {
          Swal.fire({
            title: '',
            html: `
          <h3>Seleccione la entidad </h3>
          ${htmlOpciones}
          `,
            icon: 'info',
            confirmButtonText: 'Enviar',
            allowOutsideClick: false
          }).then(() => {
            $("#login-form").hide();
            this.router.navigate([`${Pagina}`], { state: { Pestanas, datos } });
          });
        });
      });
    }
  }


  ngOnInit() {
    $("#login-form").show();
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
}