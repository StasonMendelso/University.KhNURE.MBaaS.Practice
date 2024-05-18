
package com.social_network.events.user_service;

import com.backendless.Backendless;
import com.backendless.BackendlessUser;
import com.backendless.logging.Logger;
import com.backendless.servercode.ExecutionResult;
import com.backendless.servercode.RunnerContext;
import com.social_network.timers.CheckCompleteYearsFromCreatedDateTimer;

/**
 * GenericUserEventHandler handles the User Service events.
 * The event handlers are the individual methods implemented in the class.
 * The "before" and "after" prefix determines if the handler is executed before
 * or after the default handling logic provided by Backendless.
 * The part after the prefix identifies the actual event.
 * For example, the "beforeLogin" method is the "Login" event handler and will
 * be called before Backendless applies the default login logic. The event
 * handling pipeline looks like this:
 * <p>
 * Client Request ---> Before Handler ---> Default Logic ---> After Handler --->
 * Return Response
 */
public class GenericUserEventHandler extends com.backendless.servercode.extension.UserExtender {

    @Override
    public void afterLogin(RunnerContext context, String login, String password, ExecutionResult<BackendlessUser> result) throws Exception {
        Logger logger = Backendless.Logging.getLogger(GenericUserEventHandler.class);
        if (result.getResult() != null && result.getException() == null) {
            Backendless.Counters.incrementAndGet("online_users");
            logger.trace("online_users was incremented!");
        }
    }

//    @Override
//    public void afterLogout(RunnerContext context, ExecutionResult result) throws Exception {
//        Logger logger = Backendless.Logging.getLogger(GenericUserEventHandler.class);
//        if (result.getResult()==null && result.getException() == null){
//            Backendless.Counters.decrementAndGet("online_users");
//            logger.trace("online_users was decremented!");
//        }
//    }
}


    