export var TipoMovimiento;
(function (TipoMovimiento) {
    TipoMovimiento["DEBITO"] = "DEBITO";
    TipoMovimiento["CREDITO"] = "CREDITO";
})(TipoMovimiento || (TipoMovimiento = {}));
export var OrigenMovimiento;
(function (OrigenMovimiento) {
    OrigenMovimiento["PAGO_RECURRENTE"] = "PAGO_RECURRENTE";
    OrigenMovimiento["PAGO_UNICO"] = "PAGO_UNICO";
    OrigenMovimiento["GASTO_MENOR"] = "GASTO_MENOR";
    OrigenMovimiento["AJUSTE"] = "AJUSTE";
    OrigenMovimiento["REVERSA_PAGO"] = "REVERSA_PAGO";
    OrigenMovimiento["INGRESO"] = "INGRESO";
})(OrigenMovimiento || (OrigenMovimiento = {}));
