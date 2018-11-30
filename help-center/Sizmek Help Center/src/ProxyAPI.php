<?php
#Define GLobal Static Variables
define("ZDAPIKEY", "SEFh1L6QuMWnwZuZ8t0XM4ffoQHOCNS1nFOsazuL");
define("ZDUSER", "MDX.API@sizmek.com");
define("ZDURL", "https://sizmek.zendesk.com/api/v2");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

#Function used to call Zendesk API
function curlWrap($url, $json, $action)
{
    global $ticket_ID;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
    curl_setopt($ch, CURLOPT_URL, ZDURL . $url);
    curl_setopt($ch, CURLOPT_USERPWD, ZDUSER . "/token:" . ZDAPIKEY);
    
    switch ($action) {
        case "POST":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
        case "GET":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
            break;
        case "PUT":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
        case "DELETE":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
            break;
        default:
            break;
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-type: application/json'
    ));
    curl_setopt($ch, CURLOPT_USERAGENT, "MozillaXYZ/1.0");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $output = curl_exec($ch);
    curl_close($ch);
    echo $output;
}

function json_decode_nice($json, $assoc = TRUE)
{
    $json = str_replace(array(
        "\n",
        "\r"
    ), "\\n", $json);
    $json = preg_replace('/([{,]+)(\s*)([^"]+?)\s*:/', '$1"$3":', $json);
    $json = preg_replace('/(,)\s*}$/', '}', $json);
    return json_decode($json, $assoc);
}

try {
    $ticketData    = json_decode(file_get_contents('php://input'));
    $ticket_action = $ticketData->ticket->action;
    $secutiy_tok   = $ticketData->ticket->security_token;
    
    # Create ticket object for uploading
    $data           = array();
    $data['ticket'] = array();
    
    if ($secutiy_tok == 'bWR4LmFwaUBzaXptZWsuY29tL3Rva2VuOm8zczVuOU50SERzdFc0RGI5QlU3b1pyZEFPcXZIRTc1aVJFYnlNVkQ=') {
        if ($ticket_action == 'flag') {
            
            $ticketURL = '/tickets.json';
            
            $data['ticket']['subject']        = $ticketData->ticket->subject;
            $data['ticket']['comment']        = $ticketData->ticket->comment;
            $data['ticket']['requester_id']   = (int) $ticketData->ticket->requester_id;
            $data['ticket']['group_id']       = (int) $ticketData->ticket->group_id;
            $data['ticket']['ticket_form_id'] = (int) $ticketData->ticket->ticket_form_id;
            
            $data['ticket']['tags'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->tags); $i++) {
                $data['ticket']['tags'][$i] = $ticketData->ticket->tags[$i];
            }
            
            $data['ticket']['custom_fields'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->custom_fields); $i++) {
                $data['ticket']['custom_fields'][$i]          = array();
                $data['ticket']['custom_fields'][$i]['id']    = (int) $ticketData->ticket->custom_fields[$i]->id;
                $data['ticket']['custom_fields'][$i]['value'] = $ticketData->ticket->custom_fields[$i]->value;
            }
            
            $data = json_encode($data);
            $data = curlWrap($ticketURL, $data, 'POST');
        }
        
        if ($ticket_action == 'request') {
            
            $ticketURL = '/tickets.json';
            
            $data['ticket']['subject']        = $ticketData->ticket->subject;
            $data['ticket']['comment']        = $ticketData->ticket->comment;
            $data['ticket']['requester_id']   = (int) $ticketData->ticket->requester_id;
            $data['ticket']['group_id']       = (int) $ticketData->ticket->group_id;
            $data['ticket']['ticket_form_id'] = (int) $ticketData->ticket->ticket_form_id;
            
            $data['ticket']['tags'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->tags); $i++) {
                $data['ticket']['tags'][$i] = $ticketData->ticket->tags[$i];
            }
            
            $data['ticket']['custom_fields'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->custom_fields); $i++) {
                $data['ticket']['custom_fields'][$i]          = array();
                $data['ticket']['custom_fields'][$i]['id']    = (int) $ticketData->ticket->custom_fields[$i]->id;
                $data['ticket']['custom_fields'][$i]['value'] = $ticketData->ticket->custom_fields[$i]->value;
            }
            
            $data = json_encode($data);
            $data = curlWrap($ticketURL, $data, 'POST');
        }
        
        if ($ticket_action == 'add') {
            
            $ticketURL = '/tickets.json';
            
            $data['ticket']['subject']        = $ticketData->ticket->subject;
            $data['ticket']['comment']        = $ticketData->ticket->comment;
            $data['ticket']['requester_id']   = (int) $ticketData->ticket->requester_id;
            $data['ticket']['group_id']       = (int) $ticketData->ticket->group_id;
            $data['ticket']['ticket_form_id'] = (int) $ticketData->ticket->ticket_form_id;
            
            $data['ticket']['tags'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->tags); $i++) {
                $data['ticket']['tags'][$i] = $ticketData->ticket->tags[$i];
            }
            
            $data['ticket']['custom_fields'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->custom_fields); $i++) {
                $data['ticket']['custom_fields'][$i]          = array();
                $data['ticket']['custom_fields'][$i]['id']    = (int) $ticketData->ticket->custom_fields[$i]->id;
                $data['ticket']['custom_fields'][$i]['value'] = $ticketData->ticket->custom_fields[$i]->value;
            }
            
            $data = json_encode($data);
            $data = curlWrap($ticketURL, $data, 'POST');
        }
        
        if ($ticket_action == 'update') {
            
            $updateTID = $ticketData->ticket->ticket_id;
            $ticketURL = '/tickets/' . $updateTID . '.json';
            
            $data['ticket']['comment']            = new stdClass();
            $data['ticket']['comment']->body      = $ticketData->ticket->comment->body;
            $data['ticket']['comment']->author_id = $ticketData->ticket->comment->author_id;
            
            $data['ticket']['tags'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->tags); $i++) {
                $data['ticket']['tags'][$i] = $ticketData->ticket->tags[$i];
            }
            
            $data['ticket']['custom_fields'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->custom_fields); $i++) {
                $data['ticket']['custom_fields'][$i]          = array();
                $data['ticket']['custom_fields'][$i]['id']    = (int) $ticketData->ticket->custom_fields[$i]->id;
                $data['ticket']['custom_fields'][$i]['value'] = $ticketData->ticket->custom_fields[$i]->value;
            }
            
            $data = json_encode($data);
            $data = curlWrap($ticketURL, $data, 'PUT');
        }
        
        if ($ticket_action == 'use') {

            $updateTID = $ticketData->ticket->ticket_id;
            $ticketURL = '/tickets/update_many.json?ids=' . $updateTID;
            
            $data['ticket']['additional_tags'] = array();

            for ($i = 0; $i < count($ticketData->ticket->tags); $i++) {
                $data['ticket']['additional_tags'][$i] = $ticketData->ticket->tags[$i];
            }

	    if($ticketData->ticket->suggest_article == 'true') {
            	$data['ticket']['comment']            = new stdClass();
		$data['ticket']['comment']->body      = "Hello,\n\nThank you for reaching out to Sizmek Support.\n\nWe have carefully reviewed your ticket and have found an article in our Help Center to answer your question.\n\nPlease take a look at the following article and if you still have any further questions, don't hesitate to reach out to us again.\n\n[" . $ticketData->ticket->article_url . "](" . $ticketData->ticket->article_url . ")\n\nRegards,\nSizmek Support";
		$data['ticket']['comment']->author_id = $ticketData->ticket->author_id;
	    }

            $data['ticket']['custom_fields'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->custom_fields); $i++) {
                $data['ticket']['custom_fields'][$i]          = array();
                $data['ticket']['custom_fields'][$i]['id']    = (int) $ticketData->ticket->custom_fields[$i]->id;
                $data['ticket']['custom_fields'][$i]['value'] = $ticketData->ticket->custom_fields[$i]->value;
            }
            
            $data = json_encode($data);
            $data = curlWrap($ticketURL, $data, 'PUT');
        }
        
        if ($ticket_action == 'customfields') {
            
            $updateTID = $ticketData->ticket->ticket_id;
            $ticketURL = '/tickets/' . $updateTID . '.json';
            
            $data['ticket']['custom_fields'] = array();
            
            for ($i = 0; $i < count($ticketData->ticket->custom_fields); $i++) {
                $data['ticket']['custom_fields'][$i]          = array();
                $data['ticket']['custom_fields'][$i]['id']    = (int) $ticketData->ticket->custom_fields[$i]->id;
                $data['ticket']['custom_fields'][$i]['value'] = $ticketData->ticket->custom_fields[$i]->value;
            }
            
            $data = json_encode($data);
            $data = curlWrap($ticketURL, $data, 'PUT');
        }
    }
}
catch (Exception $e) {
}
?>