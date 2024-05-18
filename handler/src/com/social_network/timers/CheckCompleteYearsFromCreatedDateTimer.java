
package com.social_network.timers;

import com.backendless.Backendless;
import com.backendless.BackendlessUser;
import com.backendless.async.callback.AsyncCallback;
import com.backendless.exceptions.BackendlessFault;
import com.backendless.logging.Logger;
import com.backendless.messaging.EmailEnvelope;
import com.backendless.messaging.MessageStatus;
import com.backendless.servercode.annotation.BackendlessTimer;

import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CheckCompleteYearsFromCreatedDateTimer is a timer.
 * It is executed according to the schedule defined in Backendless Console. The
 * class becomes a timer by extending the TimerExtender class. The information
 * about the timer, its name, schedule, expiration date/time is configured in
 * the special annotation - BackendlessTimer. The annotation contains a JSON
 * object which describes all properties of the timer.
 */
@BackendlessTimer("{'startDate':1716008400000,'language':'JAVA','mode':'DRAFT','model':'default','frequency':{'schedule':'daily','repeat':{'every':1}},'timername':'CheckCompleteYearsFromCreatedDate'}")
public class CheckCompleteYearsFromCreatedDateTimer extends com.backendless.servercode.extension.TimerExtender {

    @Override
    public void execute() {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Kiev"));
        Logger logger = Backendless.Logging.getLogger(CheckCompleteYearsFromCreatedDateTimer.class);
        List<BackendlessUser> backendlessUserList = Backendless.Data.of(BackendlessUser.class).find()
                .stream()
                .filter(backendlessUser -> {
                    Date birthdate = (Date) backendlessUser.getProperty("birthdate");
                    LocalDate birthdateKievDate = LocalDate.ofInstant(birthdate.toInstant(), ZoneId.of("Europe/Kiev"));
                    if (birthdateKievDate.getMonth() == Month.FEBRUARY && birthdateKievDate.getDayOfMonth() == 29) {
                        return (today.getMonth() == Month.FEBRUARY && today.getDayOfMonth() == 28 && !today.isLeapYear())
                                || (today.getMonth() == Month.FEBRUARY && today.getDayOfMonth() == 29 && today.isLeapYear());
                    } else {
                        return today.getMonth() == birthdateKievDate.getMonth() && today.getDayOfMonth() == birthdateKievDate.getDayOfMonth();
                    }
                }).collect(Collectors.toList());
        if (backendlessUserList.isEmpty()) {
            logger.info("No one has got birthdate today.");
        } else {
            logger.info("Someone(-s) has got birthdate today");
        }
        backendlessUserList
                .forEach(backendlessUser -> {
                    logger.info("Send greeting message to " + backendlessUser.getEmail());
                    EmailEnvelope envelope = new EmailEnvelope();
                    envelope.setTo(Collections.singleton(backendlessUser.getEmail()));
                    Backendless.Messaging.sendEmailFromTemplate("Birthdate Greeting", envelope, Map.of("Users.username", (String) backendlessUser.getProperty("username")), new AsyncCallback<MessageStatus>() {
                        @Override
                        public void handleResponse(MessageStatus response) {
                            switch (response.getStatus()) {
                                case CANCELLED, FAILED -> logger.error("Greeting wasn't given: " + response);
                                case IN_PROGRESS, SCHEDULED ->
                                        logger.info("Greeting sending is in progress: " + response);
                                case PUBLISHED -> logger.info("Greeting was be published: " + response);
                                case UNKNOWN -> logger.error("Greeting has unknown status of sending: " + response);
                            }
                        }
                        @Override
                        public void handleFault(BackendlessFault fault) {
                            logger.error("Error while sending greeting:" + fault.toString());
                        }
                    });
                });
    }

}


    