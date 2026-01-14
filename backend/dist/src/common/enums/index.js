"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.AnnotationType = exports.MachineStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OPERATOR"] = "OPERATOR";
    UserRole["MAINTENANCE"] = "MAINTENANCE";
    UserRole["ENGINEER"] = "ENGINEER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var MachineStatus;
(function (MachineStatus) {
    MachineStatus["NORMAL"] = "NORMAL";
    MachineStatus["WARNING"] = "WARNING";
    MachineStatus["FAILURE"] = "FAILURE";
    MachineStatus["MAINTENANCE"] = "MAINTENANCE";
})(MachineStatus || (exports.MachineStatus = MachineStatus = {}));
var AnnotationType;
(function (AnnotationType) {
    AnnotationType["LINE"] = "LINE";
    AnnotationType["RECTANGLE"] = "RECTANGLE";
    AnnotationType["TEXT"] = "TEXT";
    AnnotationType["CIRCLE"] = "CIRCLE";
    AnnotationType["ARROW"] = "ARROW";
})(AnnotationType || (exports.AnnotationType = AnnotationType = {}));
var EventType;
(function (EventType) {
    EventType["MACHINE_STATUS_CHANGE"] = "MACHINE_STATUS_CHANGE";
    EventType["ANNOTATION_CREATED"] = "ANNOTATION_CREATED";
    EventType["ANNOTATION_UPDATED"] = "ANNOTATION_UPDATED";
    EventType["ANNOTATION_DELETED"] = "ANNOTATION_DELETED";
    EventType["MESSAGE_SENT"] = "MESSAGE_SENT";
    EventType["USER_CONNECTED"] = "USER_CONNECTED";
    EventType["USER_DISCONNECTED"] = "USER_DISCONNECTED";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=index.js.map