<?php
/**
 * @package ImpressPages
 *
 *
 */

namespace Ip;

/**
 * Logging in a user and checking login status
 *
 */
class User
{

    /**
     * @return bool true if user is logged in
     */
    function loggedIn()
    {
        return isset($_SESSION['ipUser']['userId']);
    }

    /**
     * User logout
     * @return void
     */
    function logout()
    {
        if (isset($_SESSION['ipUser']['userId'])) {
            ipEvent('ipBeforeUserLogout', array('userId' => $this->userId()));
            unset($_SESSION['ipUser']['userId']);
            ipEvent('ipUserLogout', array('userId' => $this->userId()));
        }
    }

    /**
     * @return int loggedIn user id or false
     */
    function userId()
    {
        if (isset($_SESSION['ipUser']['userId'])) {
            return $_SESSION['ipUser']['userId'];
        } else {
            return false;
        }
    }

    /**
     * User login
     * @param int $id user id
     * @return void
     */
    function login($id)
    {
        ipEvent('ipUserLogin', array('userId' => $id));
        $_SESSION['ipUser']['userId'] = $id;
    }


}
