# Testing

You will need to install nosetests in order to run the unit and functional tests

    pip install nose

## Unit Tests

Unit tests are in service/tests/unit and can be run from the root of the application:

    nosetests service/tests/unit
    
The unit tests cover all the individual units of functionality of the system,
and are documented inline.


## Functional Tests

Functional tests are in service/tests/function and can be run from the root of the application:

    nosetests service/tests/functional
    
Some functional tests connect to external services, in particular Lantern, so their behaviour
may depend on factors that are out of our control.

When running test_lantern.py, you will need to set the following in your local.cfg file:

    TEST_ACCOUNT_EMAIL_LANTERN
    TEST_API_KEY_LANTERN
    
You can obtain a free account from [Lantern](https://lantern.cottagelabs.com) for testing purposes.

This test is also sensitive to changes in the Lantern API, so should be monitored closely,
as if the test fails, it may indicate that the Monitor UK application needs to be updated.